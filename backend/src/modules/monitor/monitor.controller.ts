import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiProduces,
  ApiSecurity,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { MonitorService } from "./monitor.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import {
  CreateMonitor,
  UpdateMonitor,
  createSuccessResponse,
  createErrorResponse,
} from "../../types/shared";

@ApiTags("Monitors")
@Controller("monitors")
@UseGuards(AuthGuard)
@ApiBearerAuth("JWT-auth")
@ApiSecurity("session")
@ApiProduces("application/json")
@ApiConsumes("application/json")
export class MonitorController {
  constructor(private monitorService: MonitorService) {}

  @Get()
  @ApiOperation({
    summary: "Get user monitors with pagination",
    description: `
Retrieves all monitors belonging to the authenticated user with pagination support.
Returns monitor details including current status, configuration, and metadata.

**Features:**
- Pagination with configurable page size
- Ordered by creation date (newest first)
- Includes monitor status, response times, and uptime statistics
- Supports filtering by monitor status (coming soon)

**Response includes:**
- Monitor configuration (URL, method, intervals)
- Current operational status (UP/DOWN/PENDING)
- Last check timestamp and response time
- Uptime percentage and reliability metrics
    `,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number starting from 1",
    example: 1,
    schema: { minimum: 1, default: 1 },
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of monitors per page (1-50)",
    example: 10,
    schema: { minimum: 1, maximum: 50, default: 10 },
  })
  @ApiResponse({
    status: 200,
    description: "Monitors retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", example: "mon_123abc" },
                  name: { type: "string", example: "My Website" },
                  url: { type: "string", example: "https://example.com" },
                  method: { type: "string", example: "GET" },
                  currentStatus: {
                    type: "string",
                    enum: ["UP", "DOWN", "PENDING"],
                    example: "UP",
                  },
                  isActive: { type: "boolean", example: true },
                  interval: { type: "number", example: 5 },
                  timeout: { type: "number", example: 30 },
                  expectedStatusCodes: {
                    type: "array",
                    items: { type: "number" },
                    example: [200, 201],
                  },
                  lastChecked: { type: "string", format: "date-time" },
                  responseTime: { type: "number", example: 245 },
                  uptime: { type: "number", example: 99.8 },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "number", example: 1 },
                limit: { type: "number", example: 10 },
                total: { type: "number", example: 25 },
                totalPages: { type: "number", example: 3 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Authentication required - Invalid or missing session/token",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: { type: "string", example: "Authentication required" },
        statusCode: { type: "number", example: 401 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid pagination parameters",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: { type: "string", example: "Invalid page or limit parameter" },
        statusCode: { type: "number", example: 400 },
      },
    },
  })
  async getMonitors(
    @Request() req,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const limitValue = Math.min(50, Math.max(1, limit));
      const pageValue = Math.max(1, page);

      const result = await this.monitorService.getMonitorsByUser(
        req.user.userId,
        pageValue,
        limitValue,
      );

      return createSuccessResponse(result);
    } catch (error) {
      console.error("Error fetching monitors:", error);
      return createErrorResponse("Failed to fetch monitors");
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific monitor by ID" })
  @ApiParam({ name: "id", description: "Monitor ID" })
  @ApiResponse({ status: 200, description: "Monitor retrieved successfully" })
  @ApiResponse({ status: 404, description: "Monitor not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMonitor(@Request() req, @Param("id") monitorId: string) {
    try {
      const monitor = await this.monitorService.getMonitorById(
        monitorId,
        req.user.userId,
      );
      return createSuccessResponse(monitor);
    } catch (error) {
      if (error.message === "Monitor not found") {
        return createErrorResponse("Monitor not found");
      }
      console.error("Error fetching monitor:", error);
      return createErrorResponse("Failed to fetch monitor");
    }
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute following uptimeMonitor rate limiting
  @ApiOperation({
    summary: "Create a new monitor",
    description: `
Creates a new uptime monitor for the authenticated user. The monitor will begin 
checking the specified URL at the configured interval once created.

**Rate Limited**: 10 requests per minute per user to prevent abuse.

**Subscription Limits**:
- **Basic Plan**: Up to 5 monitors
- **Pro Plan**: Up to 50 monitors  
- **Enterprise Plan**: Unlimited monitors

**Monitor Configuration**:
- **URL**: Must be a valid HTTP/HTTPS endpoint
- **Check Interval**: 1-60 minutes (how often to check)
- **Timeout**: 5-60 seconds (request timeout)
- **Expected Status Codes**: HTTP codes that indicate success
- **HTTP Method**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Custom Headers**: Optional authentication or custom headers
- **Request Body**: For POST/PUT/PATCH requests

**Auto-Generated Features**:
- Unique monitor ID for tracking
- Status page slug (customizable)
- Initial monitoring job scheduling
- Incident tracking setup

The monitor will start in PENDING status and begin checks immediately if active.
    `,
  })
  @ApiBody({
    description: "Monitor configuration",
    schema: {
      type: "object",
      required: ["name", "url"],
      properties: {
        name: {
          type: "string",
          description: "Descriptive name for the monitor",
          example: "My Website",
          minLength: 1,
          maxLength: 100,
        },
        url: {
          type: "string",
          description: "URL to monitor (must include protocol)",
          example: "https://example.com",
          format: "uri",
        },
        method: {
          type: "string",
          description: "HTTP method to use",
          enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
          default: "GET",
          example: "GET",
        },
        expectedStatusCodes: {
          type: "array",
          description: "HTTP status codes that indicate success",
          items: { type: "number", minimum: 100, maximum: 599 },
          default: [200],
          example: [200, 201, 202],
        },
        timeout: {
          type: "number",
          description: "Request timeout in seconds",
          minimum: 5,
          maximum: 60,
          default: 30,
          example: 30,
        },
        interval: {
          type: "number",
          description: "Check interval in minutes",
          minimum: 1,
          maximum: 60,
          default: 5,
          example: 5,
        },
        retries: {
          type: "number",
          description: "Number of retries before marking as down",
          minimum: 0,
          maximum: 5,
          default: 2,
          example: 2,
        },
        headers: {
          type: "object",
          description: "Custom HTTP headers",
          additionalProperties: { type: "string" },
          example: {
            Authorization: "Bearer token123",
            "User-Agent": "StayUp-Monitor",
          },
        },
        body: {
          type: "string",
          description: "Request body for POST/PUT/PATCH requests",
          example: '{"key": "value"}',
        },
        slug: {
          type: "string",
          description: "Custom slug for public status page (optional)",
          pattern: "^[a-z0-9-]+$",
          example: "my-website",
        },
        isActive: {
          type: "boolean",
          description: "Whether to start monitoring immediately",
          default: true,
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Monitor created successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Monitor created successfully" },
        data: {
          type: "object",
          properties: {
            id: { type: "string", example: "mon_123abc" },
            name: { type: "string", example: "My Website" },
            url: { type: "string", example: "https://example.com" },
            method: { type: "string", example: "GET" },
            currentStatus: { type: "string", example: "PENDING" },
            isActive: { type: "boolean", example: true },
            slug: { type: "string", example: "my-website-abc123" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Validation failed or invalid input",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: {
          type: "string",
          example: "Invalid URL format or slug already exists",
        },
        statusCode: { type: "number", example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Monitor limit reached for subscription plan",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: {
          type: "string",
          example:
            "Monitor limit reached. Your Basic plan allows 5 monitors. Upgrade to add more.",
        },
        statusCode: { type: "number", example: 403 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Authentication required",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: { type: "string", example: "Authentication required" },
        statusCode: { type: "number", example: 401 },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: "Rate limit exceeded",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: {
          type: "string",
          example: "Too many requests. Limit: 10 requests per minute.",
        },
        statusCode: { type: "number", example: 429 },
      },
    },
  })
  async createMonitor(@Request() req, @Body() createMonitorDto: CreateMonitor) {
    try {
      const monitor = await this.monitorService.createMonitor(
        req.user.userId,
        createMonitorDto,
        req.user.subscription || "BASIC",
      );

      return createSuccessResponse(monitor, "Monitor created successfully");
    } catch (error) {
      if (error.message?.includes("Monitor limit reached")) {
        return createErrorResponse(error.message);
      }
      if (
        error.message?.includes("Validation failed") ||
        error.message?.includes("Slug already exists")
      ) {
        return createErrorResponse(error.message);
      }
      console.error("Error creating monitor:", error);
      return createErrorResponse("Failed to create monitor");
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a monitor" })
  @ApiParam({ name: "id", description: "Monitor ID" })
  @ApiResponse({ status: 200, description: "Monitor updated successfully" })
  @ApiResponse({ status: 404, description: "Monitor not found" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateMonitor(
    @Request() req,
    @Param("id") monitorId: string,
    @Body() updateMonitorDto: UpdateMonitor,
  ) {
    try {
      const monitor = await this.monitorService.updateMonitor(
        monitorId,
        req.user.userId,
        updateMonitorDto,
      );

      return createSuccessResponse(monitor, "Monitor updated successfully");
    } catch (error) {
      if (error.message === "Monitor not found") {
        return createErrorResponse("Monitor not found");
      }
      if (error.message?.includes("Validation failed")) {
        return createErrorResponse(error.message);
      }
      console.error("Error updating monitor:", error);
      return createErrorResponse("Failed to update monitor");
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a monitor (soft delete)" })
  @ApiParam({ name: "id", description: "Monitor ID" })
  @ApiResponse({ status: 200, description: "Monitor deleted successfully" })
  @ApiResponse({ status: 404, description: "Monitor not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async deleteMonitor(@Request() req, @Param("id") monitorId: string) {
    try {
      await this.monitorService.deleteMonitor(monitorId, req.user.userId);
      return createSuccessResponse(null, "Monitor deleted successfully");
    } catch (error) {
      if (error.message === "Monitor not found") {
        return createErrorResponse("Monitor not found");
      }
      console.error("Error deleting monitor:", error);
      return createErrorResponse("Failed to delete monitor");
    }
  }

  @Patch(":id/toggle")
  @ApiOperation({ summary: "Toggle monitor active status" })
  @ApiParam({ name: "id", description: "Monitor ID" })
  @ApiResponse({
    status: 200,
    description: "Monitor status toggled successfully",
  })
  @ApiResponse({ status: 404, description: "Monitor not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async toggleMonitorStatus(@Request() req, @Param("id") monitorId: string) {
    try {
      const monitor = await this.monitorService.toggleMonitorStatus(
        monitorId,
        req.user.userId,
      );
      const statusMessage = monitor.isActive ? "activated" : "deactivated";

      return createSuccessResponse(
        monitor,
        `Monitor ${statusMessage} successfully`,
      );
    } catch (error) {
      if (error.message === "Monitor not found") {
        return createErrorResponse("Monitor not found");
      }
      console.error("Error toggling monitor status:", error);
      return createErrorResponse("Failed to toggle monitor status");
    }
  }
}
