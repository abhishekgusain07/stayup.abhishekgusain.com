import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { eq, and, desc, count } from "drizzle-orm";
import { nanoid } from "nanoid";

import { DATABASE_CONNECTION } from "../../database/database.module";
import { monitors, monitorLogs } from "../../database/schema";
import {
  CreateMonitorSchema,
  UpdateMonitorSchema,
  getSubscriptionLimits,
  type CreateMonitor,
  type UpdateMonitor,
  type Monitor,
} from "../../types/shared";

@Injectable()
export class MonitorService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    @InjectQueue("monitor-jobs") private monitorQueue: Queue,
  ) {}

  async createMonitor(
    userId: string,
    data: CreateMonitor,
    userSubscription: string,
  ): Promise<Monitor> {
    // Validate input using Zod schema
    const validatedData = CreateMonitorSchema.parse(data);

    // Check subscription limits following uptimeMonitor pattern
    const limits = getSubscriptionLimits(userSubscription);

    const [currentMonitorCount] = await this.db
      .select({ count: count() })
      .from(monitors)
      .where(and(eq(monitors.userId, userId), eq(monitors.isActive, true)));

    if (
      limits.monitors !== -1 &&
      currentMonitorCount.count >= limits.monitors
    ) {
      throw new ForbiddenException(
        `Monitor limit reached. Your ${userSubscription} plan allows ${limits.monitors} monitors. Upgrade to add more.`,
      );
    }

    // Generate unique slug if not provided
    let slug = validatedData.slug;
    if (!slug) {
      slug = nanoid(10);
      // Ensure slug is unique
      const existingSlugs = await this.db
        .select({ slug: monitors.slug })
        .from(monitors)
        .where(eq(monitors.slug, slug));

      if (existingSlugs.length > 0) {
        slug = `${slug}-${nanoid(4)}`;
      }
    } else {
      // Check if provided slug is available
      const existingSlugs = await this.db
        .select({ slug: monitors.slug })
        .from(monitors)
        .where(eq(monitors.slug, slug));

      if (existingSlugs.length > 0) {
        throw new BadRequestException(
          "Slug already exists. Please choose a different slug for your status page",
        );
      }
    }

    // Create the monitor following uptimeMonitor pattern
    const monitorId = nanoid();
    const newMonitor = await this.db
      .insert(monitors)
      .values({
        id: monitorId,
        userId,
        name: validatedData.name,
        url: validatedData.url,
        method: validatedData.method,
        expectedStatusCodes: validatedData.expectedStatusCodes,
        timeout: validatedData.timeout,
        interval: validatedData.interval,
        retries: validatedData.retries,
        headers: validatedData.headers || null,
        body: validatedData.body || null,
        slug,
        isActive: validatedData.isActive,
        currentStatus: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Log monitor creation following uptimeMonitor pattern
    await this.logMonitorAction(monitorId, "created", {
      monitorName: validatedData.name,
      url: validatedData.url,
      method: validatedData.method,
    });

    // Schedule initial monitoring job (non-blocking to prevent hanging)
    this.scheduleMonitorJob(newMonitor[0]).catch((error) => {
      console.error(`Failed to schedule job for monitor ${monitorId}:`, error);
      // Monitor creation should still succeed even if job scheduling fails
    });

    return newMonitor[0];
  }

  async getMonitorsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Monitor[]; pagination: any }> {
    const offset = (page - 1) * limit;

    // Get monitors with pagination
    const userMonitors = await this.db
      .select()
      .from(monitors)
      .where(and(eq(monitors.userId, userId)))
      .orderBy(desc(monitors.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalCount] = await this.db
      .select({ count: count() })
      .from(monitors)
      .where(and(eq(monitors.userId, userId)));

    const total = totalCount.count;
    const totalPages = Math.ceil(total / limit);

    return {
      items: userMonitors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getMonitorById(monitorId: string, userId: string): Promise<Monitor> {
    const monitor = await this.db
      .select()
      .from(monitors)
      .where(and(eq(monitors.id, monitorId), eq(monitors.userId, userId)));

    if (monitor.length === 0) {
      throw new NotFoundException("Monitor not found");
    }

    return monitor[0];
  }

  async updateMonitor(
    monitorId: string,
    userId: string,
    data: UpdateMonitor,
  ): Promise<Monitor> {
    // Validate input
    const validatedData = UpdateMonitorSchema.parse(data);

    // Verify monitor ownership
    await this.getMonitorById(monitorId, userId);

    // Build update object
    const updateFields: any = {
      updatedAt: new Date(),
    };

    // Only update provided fields following uptimeMonitor pattern
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "headers" && value) {
          updateFields[key] = value;
        } else if (key === "expectedStatusCodes") {
          updateFields[key] = value;
        } else {
          updateFields[key] = value;
        }
      }
    });

    const updatedMonitor = await this.db
      .update(monitors)
      .set(updateFields)
      .where(eq(monitors.id, monitorId))
      .returning();

    // Log monitor update
    await this.logMonitorAction(monitorId, "updated", {
      updatedFields: Object.keys(validatedData),
    });

    // Reschedule monitoring job if settings changed (non-blocking)
    if (validatedData.interval || validatedData.isActive !== undefined) {
      this.scheduleMonitorJob(updatedMonitor[0]).catch((error) => {
        console.error(
          `Failed to reschedule job for monitor ${monitorId}:`,
          error,
        );
      });
    }

    return updatedMonitor[0];
  }

  async deleteMonitor(monitorId: string, userId: string): Promise<void> {
    // Verify monitor ownership
    await this.getMonitorById(monitorId, userId);

    // Soft delete following uptimeMonitor pattern
    await this.db
      .update(monitors)
      .set({
        isActive: false,
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(monitors.id, monitorId));

    // Log monitor deletion
    await this.logMonitorAction(monitorId, "deleted", {});

    // Cancel scheduled jobs
    await this.cancelMonitorJob(monitorId);
  }

  async toggleMonitorStatus(
    monitorId: string,
    userId: string,
  ): Promise<Monitor> {
    const monitor = await this.getMonitorById(monitorId, userId);
    const newStatus = !monitor.isActive;

    const updatedMonitor = await this.db
      .update(monitors)
      .set({
        isActive: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(monitors.id, monitorId))
      .returning();

    // Log status change
    await this.logMonitorAction(monitorId, "status_changed", {
      newStatus,
      oldStatus: monitor.isActive,
    });

    // Update job scheduling (non-blocking)
    this.scheduleMonitorJob(updatedMonitor[0]).catch((error) => {
      console.error(
        `Failed to update job scheduling for monitor ${monitorId}:`,
        error,
      );
    });

    return updatedMonitor[0];
  }

  private async logMonitorAction(
    monitorId: string,
    action: string,
    details: any,
  ): Promise<void> {
    try {
      await this.db.insert(monitorLogs).values({
        id: nanoid(),
        monitorId,
        action,
        details,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error logging monitor action:", error);
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      // Test Redis connection by checking queue client
      const queueHealth = await this.monitorQueue.client.ping();
      return queueHealth === "PONG";
    } catch (error) {
      console.error("Redis health check failed:", error);
      return false;
    }
  }

  private async scheduleMonitorJob(monitor: Monitor): Promise<void> {
    try {
      if (!monitor.isActive) {
        await this.cancelMonitorJob(monitor.id);
        return;
      }

      // Check Redis health before attempting to schedule
      const redisHealthy = await this.checkRedisHealth();
      if (!redisHealthy) {
        throw new Error(
          "Redis connection is not healthy - cannot schedule jobs",
        );
      }

      // Schedule job using Bull (similar to uptimeMonitor's SQS pattern)
      const jobData = {
        monitorId: monitor.id,
        url: monitor.url,
        method: monitor.method,
        expectedStatusCodes: monitor.expectedStatusCodes,
        timeout: monitor.timeout,
        retries: monitor.retries,
        headers: monitor.headers,
        body: monitor.body,
      };

      // Add timeout to Bull queue operation to prevent hanging
      const schedulePromise = this.monitorQueue.add("check-monitor", jobData, {
        repeat: {
          every: monitor.interval * 60 * 1000, // Convert minutes to milliseconds
        },
        jobId: `monitor-${monitor.id}`, // Unique job ID for deduplication
      });

      // Race the schedule operation with a timeout
      await Promise.race([
        schedulePromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Job scheduling timeout")), 10000),
        ),
      ]);
    } catch (error) {
      console.error("Error scheduling monitor job:", error);
      throw error; // Re-throw to be caught by caller's .catch()
    }
  }

  private async cancelMonitorJob(monitorId: string): Promise<void> {
    try {
      await this.monitorQueue.removeRepeatable("check-monitor", {
        every: 60000,
        jobId: `monitor-${monitorId}`,
      });
    } catch (error) {
      console.error("Error canceling monitor job:", error);
    }
  }
}
