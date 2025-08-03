import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

import { DATABASE_CONNECTION } from "../../database/database.module";
import { monitors, alertRecipients } from "../../database/schema";
import {
  CreateAlertRecipientSchema,
  getSubscriptionLimits,
  type CreateAlertRecipient,
  type AlertRecipient,
} from "../../types/shared";

@Injectable()
export class AlertRecipientService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async createAlertRecipient(
    monitorId: string,
    userId: string,
    data: CreateAlertRecipient,
    userSubscription: string,
  ): Promise<AlertRecipient> {
    // Validate input
    const validatedData = CreateAlertRecipientSchema.parse(data);

    // Verify monitor ownership
    const monitor = await this.db
      .select()
      .from(monitors)
      .where(and(eq(monitors.id, monitorId), eq(monitors.userId, userId)));

    if (monitor.length === 0) {
      throw new NotFoundException("Monitor not found");
    }

    // Check subscription limits following uptimeMonitor pattern
    const limits = getSubscriptionLimits(userSubscription);

    const currentRecipients = await this.db
      .select()
      .from(alertRecipients)
      .where(
        and(
          eq(alertRecipients.monitorId, monitorId),
          eq(alertRecipients.isActive, true),
        ),
      );

    if (currentRecipients.length >= limits.alertRecipients) {
      throw new ForbiddenException(
        `Alert recipient limit reached. Your ${userSubscription} plan allows ${limits.alertRecipients} alert recipients per monitor. Upgrade to add more.`,
      );
    }

    // Check if email already exists for this monitor
    const existingRecipient = await this.db
      .select()
      .from(alertRecipients)
      .where(
        and(
          eq(alertRecipients.monitorId, monitorId),
          eq(alertRecipients.email, validatedData.email),
        ),
      );

    if (existingRecipient.length > 0) {
      throw new BadRequestException(
        "This email is already configured for alerts on this monitor",
      );
    }

    // Create alert recipient
    const newRecipient = await this.db
      .insert(alertRecipients)
      .values({
        id: nanoid(),
        monitorId,
        email: validatedData.email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newRecipient[0];
  }

  async getAlertRecipients(
    monitorId: string,
    userId: string,
  ): Promise<AlertRecipient[]> {
    // Verify monitor ownership
    const monitor = await this.db
      .select()
      .from(monitors)
      .where(and(eq(monitors.id, monitorId), eq(monitors.userId, userId)));

    if (monitor.length === 0) {
      throw new NotFoundException("Monitor not found");
    }

    // Get alert recipients
    return await this.db
      .select()
      .from(alertRecipients)
      .where(eq(alertRecipients.monitorId, monitorId));
  }

  async deleteAlertRecipient(
    recipientId: string,
    monitorId: string,
    userId: string,
  ): Promise<void> {
    // Verify monitor ownership
    const monitor = await this.db
      .select()
      .from(monitors)
      .where(and(eq(monitors.id, monitorId), eq(monitors.userId, userId)));

    if (monitor.length === 0) {
      throw new NotFoundException("Monitor not found");
    }

    // Verify alert recipient exists
    const recipient = await this.db
      .select()
      .from(alertRecipients)
      .where(
        and(
          eq(alertRecipients.id, recipientId),
          eq(alertRecipients.monitorId, monitorId),
        ),
      );

    if (recipient.length === 0) {
      throw new NotFoundException("Alert recipient not found");
    }

    // Delete alert recipient
    await this.db
      .delete(alertRecipients)
      .where(eq(alertRecipients.id, recipientId));
  }

  async toggleAlertRecipient(
    recipientId: string,
    monitorId: string,
    userId: string,
  ): Promise<AlertRecipient> {
    // Verify monitor ownership
    const monitor = await this.db
      .select()
      .from(monitors)
      .where(and(eq(monitors.id, monitorId), eq(monitors.userId, userId)));

    if (monitor.length === 0) {
      throw new NotFoundException("Monitor not found");
    }

    // Verify alert recipient exists
    const recipient = await this.db
      .select()
      .from(alertRecipients)
      .where(
        and(
          eq(alertRecipients.id, recipientId),
          eq(alertRecipients.monitorId, monitorId),
        ),
      );

    if (recipient.length === 0) {
      throw new NotFoundException("Alert recipient not found");
    }

    // Toggle status
    const newStatus = !recipient[0].isActive;
    const updatedRecipient = await this.db
      .update(alertRecipients)
      .set({
        isActive: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(alertRecipients.id, recipientId))
      .returning();

    return updatedRecipient[0];
  }
}
