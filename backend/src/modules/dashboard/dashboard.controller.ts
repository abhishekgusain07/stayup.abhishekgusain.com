import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiProduces,
} from "@nestjs/swagger";
import { AuthGuard } from "../auth/guards/auth.guard";
import { DashboardService } from "./dashboard.service";

@ApiTags("Dashboard")
@Controller("dashboard")
@UseGuards(AuthGuard)
@ApiBearerAuth("JWT-auth")
@ApiSecurity("session")
@ApiProduces("application/json")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: "Get dashboard overview statistics",
    description: `
Retrieves comprehensive dashboard statistics for the authenticated user's monitoring setup.
Provides a high-level overview of monitor health, incidents, and performance metrics.

**Dashboard includes**:
- **Monitor Summary**: Total monitors, active/inactive counts, status distribution
- **Uptime Statistics**: Overall uptime percentage, availability trends
- **Incident Metrics**: Active incidents, recent incidents, resolution times
- **Performance Data**: Average response times, slowest monitors
- **Usage Statistics**: Check quota usage, subscription limits

**Data Timeframes**:
- Real-time status information
- 24-hour incident summary
- 7-day uptime averages
- 30-day performance trends

This endpoint is optimized for dashboard loading and provides cached results for better performance.
    `,
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            monitors: {
              type: "object",
              properties: {
                total: { type: "number", example: 15 },
                active: { type: "number", example: 12 },
                inactive: { type: "number", example: 3 },
                status: {
                  type: "object",
                  properties: {
                    up: { type: "number", example: 10 },
                    down: { type: "number", example: 2 },
                    pending: { type: "number", example: 0 },
                  },
                },
              },
            },
            uptime: {
              type: "object",
              properties: {
                overall: { type: "number", example: 99.2 },
                last24h: { type: "number", example: 98.8 },
                last7d: { type: "number", example: 99.5 },
                last30d: { type: "number", example: 99.1 },
              },
            },
            incidents: {
              type: "object",
              properties: {
                active: { type: "number", example: 1 },
                last24h: { type: "number", example: 3 },
                last7d: { type: "number", example: 8 },
                avgResolutionTime: {
                  type: "number",
                  example: 12.5,
                  description: "Minutes",
                },
              },
            },
            performance: {
              type: "object",
              properties: {
                avgResponseTime: {
                  type: "number",
                  example: 245,
                  description: "Milliseconds",
                },
                slowestMonitor: { type: "string", example: "My API Endpoint" },
                fastestMonitor: { type: "string", example: "My Website" },
              },
            },
            usage: {
              type: "object",
              properties: {
                checksThisMonth: { type: "number", example: 12500 },
                checksLimit: { type: "number", example: 50000 },
                monitorsUsed: { type: "number", example: 15 },
                monitorsLimit: { type: "number", example: 50 },
              },
            },
          },
        },
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
  async getDashboardStats() {
    // TODO: Implement dashboard statistics
    return {
      success: true,
      data: {
        monitors: {
          total: 0,
          active: 0,
          inactive: 0,
          status: { up: 0, down: 0, pending: 0 },
        },
        uptime: { overall: 0, last24h: 0, last7d: 0, last30d: 0 },
        incidents: { active: 0, last24h: 0, last7d: 0, avgResolutionTime: 0 },
        performance: {
          avgResponseTime: 0,
          slowestMonitor: null,
          fastestMonitor: null,
        },
        usage: {
          checksThisMonth: 0,
          checksLimit: 0,
          monitorsUsed: 0,
          monitorsLimit: 0,
        },
      },
    };
  }
}
