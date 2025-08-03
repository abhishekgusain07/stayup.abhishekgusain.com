import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiProduces,
} from "@nestjs/swagger";
import { WebsiteService } from "./website.service";

@ApiTags("Public Status")
@Controller("websites")
@ApiProduces("application/json")
export class WebsiteController {
  constructor(private websiteService: WebsiteService) {}

  @Get(":slug")
  @ApiOperation({
    summary: "Get public status page for monitor",
    description: `
Retrieves public status information for a monitor using its slug.
This endpoint is **public** and does not require authentication.

**Public Status Page Features**:
- Current monitor status (UP/DOWN/PENDING)
- Recent uptime history and statistics
- Response time trends
- Recent incidents and maintenance
- Service availability overview

**Use Cases**:
- Embedding status widgets in websites
- Public status page displays
- Customer-facing service health checks
- Third-party integrations

**Data Privacy**:
- Only shows public information (no sensitive config)
- Respects monitor visibility settings
- No authentication required

The slug is typically generated automatically when creating a monitor,
but can be customized for branded status pages.
    `,
  })
  @ApiParam({
    name: "slug",
    description: "Monitor slug identifier for public status page",
    example: "my-website",
    schema: {
      type: "string",
      pattern: "^[a-z0-9-]+$",
      minLength: 3,
      maxLength: 50,
    },
  })
  @ApiResponse({
    status: 200,
    description: "Public status information retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            monitor: {
              type: "object",
              properties: {
                name: { type: "string", example: "My Website" },
                url: { type: "string", example: "https://example.com" },
                slug: { type: "string", example: "my-website" },
                currentStatus: {
                  type: "string",
                  enum: ["UP", "DOWN", "PENDING"],
                  example: "UP",
                },
                lastChecked: { type: "string", format: "date-time" },
                responseTime: {
                  type: "number",
                  example: 245,
                  description: "Milliseconds",
                },
              },
            },
            uptime: {
              type: "object",
              properties: {
                last24h: { type: "number", example: 99.8 },
                last7d: { type: "number", example: 99.5 },
                last30d: { type: "number", example: 99.2 },
                last90d: { type: "number", example: 98.9 },
              },
            },
            recentIncidents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", example: "inc_123abc" },
                  title: { type: "string", example: "Service Outage" },
                  status: {
                    type: "string",
                    enum: ["ONGOING", "RESOLVED"],
                    example: "RESOLVED",
                  },
                  startTime: { type: "string", format: "date-time" },
                  endTime: { type: "string", format: "date-time" },
                  duration: {
                    type: "number",
                    example: 15,
                    description: "Minutes",
                  },
                },
              },
            },
            responseTimeHistory: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string", format: "date-time" },
                  responseTime: { type: "number", description: "Milliseconds" },
                  status: { type: "string", enum: ["UP", "DOWN"] },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Monitor not found or not public",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: {
          type: "string",
          example: "Monitor not found or not available publicly",
        },
        statusCode: { type: "number", example: 404 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid slug format",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: { type: "string", example: "Invalid slug format" },
        statusCode: { type: "number", example: 400 },
      },
    },
  })
  async getMonitorStatus(@Param("slug") slug: string) {
    // TODO: Implement public status page by slug
    return {
      success: true,
      data: {
        monitor: {
          name: "Sample Monitor",
          url: "https://example.com",
          slug: slug,
          currentStatus: "UP",
          lastChecked: new Date().toISOString(),
          responseTime: 245,
        },
        uptime: { last24h: 99.8, last7d: 99.5, last30d: 99.2, last90d: 98.9 },
        recentIncidents: [],
        responseTimeHistory: [],
      },
    };
  }
}
