import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { eq, and } from "drizzle-orm";

import { DATABASE_CONNECTION } from "../../database/database.module";
import { monitors, incidents, alertRecipients } from "../../database/schema";

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
  ) {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter following uptimeMonitor's nodemailer pattern
   */
  private initializeTransporter(): void {
    const smtpConfig = {
      host: this.configService.get("SMTP_HOST"),
      port: parseInt(this.configService.get("SMTP_PORT")) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get("SMTP_USER"),
        pass: this.configService.get("SMTP_PASS"),
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);

    console.log("Email transporter initialized:", {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user
        ? smtpConfig.auth.user.substring(0, 3) + "***"
        : "not set",
    });
  }

  /**
   * Send downtime alert following uptimeMonitor's incidentNotifier pattern
   */
  async sendDowntimeAlert(incidentId: string): Promise<void> {
    try {
      console.log(`📧 Processing downtime alert for incident: ${incidentId}`);

      // Get incident details with monitor info
      const incident = await this.getIncidentWithMonitor(incidentId);
      if (!incident) {
        console.error(`Incident not found: ${incidentId}`);
        return;
      }

      // Check notification throttling (1 hour minimum between alerts)
      if (this.shouldThrottleNotification(incident)) {
        console.log(`⏳ Notification throttled for incident: ${incidentId}`);
        return;
      }

      // Get alert recipients for this monitor
      const recipients = await this.getAlertRecipients(incident.monitorId);
      if (recipients.length === 0) {
        console.log(
          `📭 No alert recipients configured for monitor: ${incident.monitorId}`,
        );
        return;
      }

      // Send email to each recipient
      const emailPromises = recipients.map((recipient) =>
        this.sendDowntimeEmail(incident, recipient.email),
      );

      await Promise.all(emailPromises);

      // Update incident with notification timestamp
      await this.updateIncidentNotificationTime(incidentId);

      console.log(
        `✅ Downtime alerts sent for incident ${incidentId} to ${recipients.length} recipients`,
      );
    } catch (error) {
      console.error("Error sending downtime alert:", {
        incidentId,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Send recovery alert following uptimeMonitor pattern
   */
  async sendRecoveryAlert(incidentId: string): Promise<void> {
    try {
      console.log(`🟢 Processing recovery alert for incident: ${incidentId}`);

      // Get resolved incident details with monitor info
      const incident = await this.getIncidentWithMonitor(incidentId);
      if (!incident) {
        console.error(`Incident not found: ${incidentId}`);
        return;
      }

      // Get alert recipients for this monitor
      const recipients = await this.getAlertRecipients(incident.monitorId);
      if (recipients.length === 0) {
        console.log(
          `📭 No alert recipients configured for monitor: ${incident.monitorId}`,
        );
        return;
      }

      // Send recovery email to each recipient
      const emailPromises = recipients.map((recipient) =>
        this.sendRecoveryEmail(incident, recipient.email),
      );

      await Promise.all(emailPromises);

      console.log(
        `✅ Recovery alerts sent for incident ${incidentId} to ${recipients.length} recipients`,
      );
    } catch (error) {
      console.error("Error sending recovery alert:", {
        incidentId,
        error: error.message,
      });
    }
  }

  /**
   * Get incident with monitor information
   */
  private async getIncidentWithMonitor(incidentId: string): Promise<any> {
    try {
      const result = await this.db
        .select({
          incident: incidents,
          monitor: monitors,
        })
        .from(incidents)
        .innerJoin(monitors, eq(incidents.monitorId, monitors.id))
        .where(eq(incidents.id, incidentId));

      if (result.length === 0) {
        return null;
      }

      return {
        ...result[0].incident,
        monitor: result[0].monitor,
      };
    } catch (error) {
      console.error("Error getting incident with monitor:", error);
      throw error;
    }
  }

  /**
   * Check if notification should be throttled (1 hour minimum between alerts)
   */
  private shouldThrottleNotification(incident: any): boolean {
    if (!incident.lastNotifiedAt) {
      return false; // Never notified, should send
    }

    const lastNotified = new Date(incident.lastNotifiedAt);
    const now = new Date();
    const hoursSinceLastNotification =
      (now.getTime() - lastNotified.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastNotification < 1; // Throttle if less than 1 hour
  }

  /**
   * Get alert recipients for a monitor
   */
  private async getAlertRecipients(monitorId: string): Promise<any[]> {
    try {
      return await this.db
        .select()
        .from(alertRecipients)
        .where(
          and(
            eq(alertRecipients.monitorId, monitorId),
            eq(alertRecipients.isActive, true),
          ),
        );
    } catch (error) {
      console.error("Error getting alert recipients:", error);
      throw error;
    }
  }

  /**
   * Send downtime email following uptimeMonitor's HTML/text format
   */
  private async sendDowntimeEmail(
    incident: any,
    recipientEmail: string,
  ): Promise<void> {
    try {
      const subject = `🔴 ${incident.monitor.name} is DOWN`;

      const htmlContent = this.generateDowntimeHtmlEmail(incident);
      const textContent = this.generateDowntimeTextEmail(incident);

      const mailOptions = {
        from: this.configService.get("EMAIL_FROM") || "noreply@stayup.dev",
        to: recipientEmail,
        subject,
        html: htmlContent,
        text: textContent,
      };

      await this.transporter.sendMail(mailOptions);

      console.log(`📧 Downtime email sent to: ${recipientEmail}`);
    } catch (error) {
      console.error(
        `Failed to send downtime email to ${recipientEmail}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send recovery email following uptimeMonitor pattern
   */
  private async sendRecoveryEmail(
    incident: any,
    recipientEmail: string,
  ): Promise<void> {
    try {
      const downtimeDuration = this.formatDuration(incident.duration);
      const subject = `🟢 ${incident.monitor.name} is RECOVERED`;

      const htmlContent = this.generateRecoveryHtmlEmail(
        incident,
        downtimeDuration,
      );
      const textContent = this.generateRecoveryTextEmail(
        incident,
        downtimeDuration,
      );

      const mailOptions = {
        from: this.configService.get("EMAIL_FROM") || "noreply@stayup.dev",
        to: recipientEmail,
        subject,
        html: htmlContent,
        text: textContent,
      };

      await this.transporter.sendMail(mailOptions);

      console.log(`🟢 Recovery email sent to: ${recipientEmail}`);
    } catch (error) {
      console.error(
        `Failed to send recovery email to ${recipientEmail}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate HTML email for downtime alert
   */
  private generateDowntimeHtmlEmail(incident: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>StayUp Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .monitor-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔴 Monitor Down Alert</h1>
    </div>
    <div class="content">
        <p>Your monitored service is currently down.</p>
        
        <div class="monitor-info">
            <strong>Monitor:</strong> ${incident.monitor.name}<br>
            <strong>URL:</strong> ${incident.monitor.url}<br>
            <strong>Incident Started:</strong> ${new Date(incident.startedAt).toLocaleString()}<br>
            <strong>Error:</strong> ${incident.errorMessage || "Connection failed"}
        </div>
        
        <p>We'll continue monitoring and notify you when the service is restored.</p>
        
        ${
          incident.monitor.slug
            ? `
        <p>View public status: <a href="https://stayup.dev/status/${incident.monitor.slug}">https://stayup.dev/status/${incident.monitor.slug}</a></p>
        `
            : ""
        }
    </div>
    <div class="footer">
        <p>This alert was sent by StayUp Monitoring<br>
        You're receiving this because you're configured as an alert recipient for this monitor.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text email for downtime alert
   */
  private generateDowntimeTextEmail(incident: any): string {
    return `
🔴 MONITOR DOWN ALERT

Your monitored service is currently down.

Monitor: ${incident.monitor.name}
URL: ${incident.monitor.url}
Incident Started: ${new Date(incident.startedAt).toLocaleString()}
Error: ${incident.errorMessage || "Connection failed"}

We'll continue monitoring and notify you when the service is restored.

${incident.monitor.slug ? `View public status: https://stayup.dev/status/${incident.monitor.slug}` : ""}

---
This alert was sent by StayUp Monitoring
You're receiving this because you're configured as an alert recipient for this monitor.
`;
  }

  /**
   * Generate HTML email for recovery alert
   */
  private generateRecoveryHtmlEmail(
    incident: any,
    downtimeDuration: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>StayUp Recovery</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .monitor-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🟢 Service Recovered</h1>
    </div>
    <div class="content">
        <p>Great news! Your monitored service is back online.</p>
        
        <div class="monitor-info">
            <strong>Monitor:</strong> ${incident.monitor.name}<br>
            <strong>URL:</strong> ${incident.monitor.url}<br>
            <strong>Downtime Duration:</strong> ${downtimeDuration}<br>
            <strong>Recovered At:</strong> ${new Date(incident.resolvedAt).toLocaleString()}
        </div>
        
        <p>The service is now responding normally.</p>
        
        ${
          incident.monitor.slug
            ? `
        <p>View public status: <a href="https://stayup.dev/status/${incident.monitor.slug}">https://stayup.dev/status/${incident.monitor.slug}</a></p>
        `
            : ""
        }
    </div>
    <div class="footer">
        <p>This recovery notification was sent by StayUp Monitoring</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text email for recovery alert
   */
  private generateRecoveryTextEmail(
    incident: any,
    downtimeDuration: string,
  ): string {
    return `
🟢 SERVICE RECOVERED

Great news! Your monitored service is back online.

Monitor: ${incident.monitor.name}
URL: ${incident.monitor.url}
Downtime Duration: ${downtimeDuration}
Recovered At: ${new Date(incident.resolvedAt).toLocaleString()}

The service is now responding normally.

${incident.monitor.slug ? `View public status: https://stayup.dev/status/${incident.monitor.slug}` : ""}

---
This recovery notification was sent by StayUp Monitoring
`;
  }

  /**
   * Update incident notification timestamp
   */
  private async updateIncidentNotificationTime(
    incidentId: string,
  ): Promise<void> {
    try {
      await this.db
        .update(incidents)
        .set({
          lastNotifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(incidents.id, incidentId));
    } catch (error) {
      console.error("Error updating incident notification time:", error);
      throw error;
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(seconds: number): string {
    if (!seconds) return "Unknown";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

    return parts.join(" ") || "< 1s";
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("✅ Email transporter is ready");
      return true;
    } catch (error) {
      console.error("❌ Email transporter test failed:", error.message);
      return false;
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(recipientEmail: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get("EMAIL_FROM") || "noreply@stayup.dev",
        to: recipientEmail,
        subject: "🧪 StayUp Test Email",
        html: `
          <h2>Test Email from StayUp Monitoring</h2>
          <p>This is a test email to verify your email configuration.</p>
          <p>If you received this, your email alerts are working correctly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
        text: `
Test Email from StayUp Monitoring

This is a test email to verify your email configuration.
If you received this, your email alerts are working correctly!

Timestamp: ${new Date().toLocaleString()}
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`🧪 Test email sent to: ${recipientEmail}`);
    } catch (error) {
      console.error(`Failed to send test email to ${recipientEmail}:`, error);
      throw error;
    }
  }
}
