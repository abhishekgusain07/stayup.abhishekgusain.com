import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

import { DATABASE_CONNECTION } from "../../database/database.module";
import {
  monitors,
  monitorResults,
  incidents,
  monitorLogs,
} from "../../database/schema";
import { NotificationService } from "../notification/notification.service";
import {
  WebhookMonitorResultSchema,
  MonitorJobResultSchema,
  MONITOR_STATUS,
  INCIDENT_STATUS,
  type WebhookMonitorResult,
  type MonitorJobResult,
} from "../../types/shared";

@Injectable()
export class WebhookService {
  private readonly internalApiSecret: string;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {
    this.internalApiSecret =
      this.configService.get<string>("INTERNAL_API_SECRET") || "";
    if (!this.internalApiSecret) {
      throw new Error("INTERNAL_API_SECRET environment variable is required");
    }
  }

  /**
   * Verify internal API secret following uptimeMonitor's security pattern
   */
  verifyApiSecret(providedSecret: string): void {
    if (!providedSecret || providedSecret !== this.internalApiSecret) {
      throw new UnauthorizedException("Invalid or missing API secret");
    }
  }

  /**
   * Process monitoring results from Lambda workers following uptimeMonitor pattern
   */
  async processMonitorResults(
    webhookData: any,
    apiSecret: string,
  ): Promise<void> {
    // Verify API secret
    this.verifyApiSecret(apiSecret);

    // Validate webhook payload
    const validatedData = WebhookMonitorResultSchema.parse(webhookData);

    console.log("Processing monitoring results from Lambda:", {
      region: validatedData.region,
      resultCount: validatedData.results.length,
      lambdaRequestId: validatedData.lambdaRequestId,
    });

    // Process each monitoring result
    const processedResults = [];
    const incidents = [];

    for (const result of validatedData.results) {
      try {
        // Validate individual result
        const validatedResult = MonitorJobResultSchema.parse(result);

        // Store monitoring result
        await this.storeMonitorResult(validatedResult);

        // Update monitor status
        await this.updateMonitorStatus(validatedResult);

        // Handle incident management
        const incident = await this.handleIncidentManagement(validatedResult);
        if (incident) {
          incidents.push(incident);
        }

        // Log the monitoring check
        await this.logMonitorCheck(validatedResult);

        processedResults.push(validatedResult);

        console.log("Processed monitoring result:", {
          monitorId: validatedResult.monitorId,
          status: validatedResult.status,
          responseTime: validatedResult.responseTime,
          region: validatedResult.region,
        });
      } catch (error) {
        console.error("Error processing individual monitoring result:", {
          monitorId: result.monitorId,
          error: error.message,
          result,
        });
      }
    }

    console.log("Webhook processing completed:", {
      totalResults: validatedData.results.length,
      processedResults: processedResults.length,
      incidentsCreated: incidents.length,
      region: validatedData.region,
    });
  }

  /**
   * Store monitoring result in database following uptimeMonitor pattern
   */
  private async storeMonitorResult(result: MonitorJobResult): Promise<void> {
    try {
      await this.db.insert(monitorResults).values({
        id: nanoid(),
        monitorId: result.monitorId,
        region: result.region,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
        checkedAt: new Date(result.checkedAt),
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error storing monitor result:", {
        monitorId: result.monitorId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update monitor status following uptimeMonitor pattern
   */
  private async updateMonitorStatus(result: MonitorJobResult): Promise<void> {
    try {
      const updateData: any = {
        lastCheckedAt: new Date(result.checkedAt),
        updatedAt: new Date(),
      };

      // Update current status if it has changed
      updateData.currentStatus = result.status;

      // Update last incident time if monitor is down
      if (result.status === MONITOR_STATUS.DOWN) {
        updateData.lastIncidentAt = new Date(result.checkedAt);
      }

      await this.db
        .update(monitors)
        .set(updateData)
        .where(eq(monitors.id, result.monitorId));
    } catch (error) {
      console.error("Error updating monitor status:", {
        monitorId: result.monitorId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Handle incident creation and resolution following uptimeMonitor pattern
   */
  private async handleIncidentManagement(
    result: MonitorJobResult,
  ): Promise<any> {
    try {
      // Check for existing open incident
      const existingIncidents = await this.db
        .select()
        .from(incidents)
        .where(
          and(
            eq(incidents.monitorId, result.monitorId),
            eq(incidents.status, INCIDENT_STATUS.OPEN),
          ),
        );

      if (result.status === MONITOR_STATUS.DOWN) {
        // Create incident if monitor is down and no open incident exists
        if (existingIncidents.length === 0) {
          const newIncident = await this.createIncident(result);
          console.log("Created new incident:", {
            incidentId: newIncident.id,
            monitorId: result.monitorId,
            errorMessage: result.errorMessage,
          });

          // Send downtime alert following uptimeMonitor pattern
          try {
            await this.notificationService.sendDowntimeAlert(newIncident.id);
          } catch (error) {
            console.error("Failed to send downtime alert:", error);
          }

          return newIncident;
        } else {
          // Update existing incident with latest error message
          await this.updateIncident(existingIncidents[0].id, result);
        }
      } else if (
        result.status === MONITOR_STATUS.UP &&
        existingIncidents.length > 0
      ) {
        // Resolve incident if monitor is up and incident exists
        const resolvedIncident = await this.resolveIncident(
          existingIncidents[0].id,
        );
        console.log("Resolved incident:", {
          incidentId: resolvedIncident.id,
          monitorId: result.monitorId,
          duration: resolvedIncident.duration,
        });

        // Send recovery alert following uptimeMonitor pattern
        try {
          await this.notificationService.sendRecoveryAlert(resolvedIncident.id);
        } catch (error) {
          console.error("Failed to send recovery alert:", error);
        }

        return resolvedIncident;
      }

      return null;
    } catch (error) {
      console.error("Error in incident management:", {
        monitorId: result.monitorId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create new incident following uptimeMonitor pattern
   */
  private async createIncident(result: MonitorJobResult): Promise<any> {
    const newIncident = await this.db
      .insert(incidents)
      .values({
        id: nanoid(),
        monitorId: result.monitorId,
        status: INCIDENT_STATUS.OPEN,
        startedAt: new Date(result.checkedAt),
        errorMessage: result.errorMessage,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newIncident[0];
  }

  /**
   * Update existing incident with latest information
   */
  private async updateIncident(
    incidentId: string,
    result: MonitorJobResult,
  ): Promise<void> {
    await this.db
      .update(incidents)
      .set({
        errorMessage: result.errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(incidents.id, incidentId));
  }

  /**
   * Resolve incident following uptimeMonitor pattern
   */
  private async resolveIncident(incidentId: string): Promise<any> {
    const incident = await this.db
      .select()
      .from(incidents)
      .where(eq(incidents.id, incidentId));

    if (incident.length === 0) {
      throw new BadRequestException("Incident not found");
    }

    const resolvedAt = new Date();
    const startedAt = new Date(incident[0].startedAt);
    const duration = Math.floor(
      (resolvedAt.getTime() - startedAt.getTime()) / 1000,
    ); // Duration in seconds

    const resolvedIncident = await this.db
      .update(incidents)
      .set({
        status: INCIDENT_STATUS.RESOLVED,
        resolvedAt,
        duration,
        updatedAt: resolvedAt,
      })
      .where(eq(incidents.id, incidentId))
      .returning();

    return resolvedIncident[0];
  }

  /**
   * Log monitoring check action following uptimeMonitor pattern
   */
  private async logMonitorCheck(result: MonitorJobResult): Promise<void> {
    try {
      await this.db.insert(monitorLogs).values({
        id: nanoid(),
        monitorId: result.monitorId,
        action: "checked",
        details: {
          region: result.region,
          status: result.status,
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          errorMessage: result.errorMessage,
          checkedAt: result.checkedAt,
        },
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error logging monitor check:", {
        monitorId: result.monitorId,
        error: error.message,
      });
      // Don't throw error for logging failures
    }
  }

  /**
   * Get webhook health status for monitoring
   */
  async getWebhookHealth(): Promise<any> {
    try {
      // Simple health check - verify database connectivity
      const testQuery = await this.db.select().from(monitors).limit(1);

      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error.message,
      };
    }
  }
}
