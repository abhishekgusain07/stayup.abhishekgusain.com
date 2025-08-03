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
import { IncidentService } from "./incident.service";

@ApiTags("Incidents")
@Controller("incidents")
@UseGuards(AuthGuard)
@ApiBearerAuth("JWT-auth")
@ApiSecurity("session")
@ApiProduces("application/json")
export class IncidentController {
  constructor(private incidentService: IncidentService) {}

  @Get()
  @ApiOperation({
    summary: "Get user incidents with history",
    description: `
Retrieves all incidents for the authenticated user's monitors with detailed information.
Includes both active (ongoing) and resolved incidents with timeline data.

**Incident Information**:
- **Status**: ONGOING, RESOLVED, ACKNOWLEDGED
- **Timeline**: Start time, end time, duration
- **Monitor Details**: Which monitor was affected
- **Impact**: Service availability impact
- **Resolution**: How the incident was resolved

**Sorting**: Most recent incidents first
**Filtering**: All incidents for user's monitors
**Status Types**:
- **ONGOING**: Currently affecting service
- **RESOLVED**: Issue has been fixed
- **ACKNOWLEDGED**: Incident noted but still ongoing
    `,
  })
  @ApiResponse({
    status: 200,
    description: "Incidents retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", example: "inc_123abc" },
              monitorId: { type: "string", example: "mon_456def" },
              monitorName: { type: "string", example: "My Website" },
              title: { type: "string", example: "Service Outage" },
              description: {
                type: "string",
                example: "Website is not responding",
              },
              status: {
                type: "string",
                enum: ["ONGOING", "RESOLVED", "ACKNOWLEDGED"],
                example: "RESOLVED",
              },
              severity: {
                type: "string",
                enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                example: "HIGH",
              },
              startTime: { type: "string", format: "date-time" },
              endTime: { type: "string", format: "date-time" },
              duration: { type: "number", example: 15, description: "Minutes" },
              affectedUrl: { type: "string", example: "https://example.com" },
              responseCode: { type: "number", example: 500 },
              errorMessage: { type: "string", example: "Connection timeout" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
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
  async getIncidents() {
    // TODO: Implement incident retrieval
    return { success: true, data: [] };
  }
}
