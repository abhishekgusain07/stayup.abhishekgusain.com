import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SQS } from 'aws-sdk';
import { eq, and, lt, isNull, or, gte, count } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../database/database.module';
import { monitors } from '../../database/schema';
import { 
  MonitorJob,
  MONITOR_REGION,
  HTTP_METHOD,
} from '@stayup/shared-types';

@Injectable()
export class SchedulerService {
  private sqsClients: Map<string, SQS>;
  private regionQueueUrls: Map<string, string>;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
  ) {
    this.initializeSQSClients();
  }

  /**
   * Initialize SQS clients for each region following uptimeMonitor pattern
   */
  private initializeSQSClients(): void {
    this.sqsClients = new Map();
    this.regionQueueUrls = new Map();

    const regions = [
      MONITOR_REGION.US_EAST,
      MONITOR_REGION.EU_WEST,
      MONITOR_REGION.AP_SOUTH,
    ];

    for (const region of regions) {
      // Create SQS client for each region
      const sqsClient = new SQS({
        region,
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      });

      this.sqsClients.set(region, sqsClient);

      // Set queue URL for each region
      const queueUrl = `https://sqs.${region}.amazonaws.com/${this.configService.get('AWS_ACCOUNT_ID')}/stayup-monitor-queue-${region}`;
      this.regionQueueUrls.set(region, queueUrl);
    }

    console.log('SQS clients initialized for regions:', Array.from(this.sqsClients.keys()));
  }

  /**
   * Main scheduler cron job running every minute following uptimeMonitor's runScheduler pattern
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async scheduleMonitoringJobs(): Promise<void> {
    try {
      console.log('🕒 Running monitor scheduler...');
      
      const startTime = Date.now();
      
      // Find monitors that need to be checked (following uptimeMonitor logic)
      const monitorsToCheck = await this.findMonitorsDueForCheck();
      
      if (monitorsToCheck.length === 0) {
        console.log('✅ No monitors due for checking');
        return;
      }

      console.log(`📋 Found ${monitorsToCheck.length} monitors due for checking`);

      // Distribute jobs across regions
      const jobsByRegion = await this.distributeJobsAcrossRegions(monitorsToCheck);
      
      // Send jobs to SQS queues
      const totalJobsSent = await this.sendJobsToSQS(jobsByRegion);
      
      // Update lastCheckedAt timestamps
      await this.updateMonitorTimestamps(monitorsToCheck);

      const duration = Date.now() - startTime;
      console.log(`✅ Scheduler completed: ${totalJobsSent} jobs sent across ${Object.keys(jobsByRegion).length} regions in ${duration}ms`);

    } catch (error) {
      console.error('❌ Error in monitor scheduler:', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Find monitors that need to be checked following uptimeMonitor pattern
   * Checks monitors that haven't been checked in interval + 1 minute
   */
  private async findMonitorsDueForCheck(): Promise<any[]> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - 3); // Check monitors not checked in 3+ minutes

      const monitors = await this.db
        .select()
        .from(monitors)
        .where(
          and(
            eq(monitors.isActive, true),
            eq(monitors.isDeleted, false),
            // Either never checked or last check was more than interval minutes ago
            or(
              isNull(monitors.lastCheckedAt),
              lt(monitors.lastCheckedAt, cutoffTime)
            )
          )
        );

      return monitors.filter(monitor => {
        if (!monitor.lastCheckedAt) {
          return true; // Never checked, should be checked
        }

        const lastChecked = new Date(monitor.lastCheckedAt);
        const now = new Date();
        const intervalMs = monitor.interval * 60 * 1000; // Convert minutes to milliseconds
        const timeSinceLastCheck = now.getTime() - lastChecked.getTime();

        return timeSinceLastCheck >= intervalMs;
      });

    } catch (error) {
      console.error('Error finding monitors due for check:', error);
      throw error;
    }
  }

  /**
   * Distribute monitoring jobs across regions following uptimeMonitor pattern
   */
  private async distributeJobsAcrossRegions(monitors: any[]): Promise<Record<string, MonitorJob[]>> {
    const jobsByRegion: Record<string, MonitorJob[]> = {};
    
    // Initialize regions
    const regions = [
      MONITOR_REGION.US_EAST,
      MONITOR_REGION.EU_WEST,
      MONITOR_REGION.AP_SOUTH,
    ];

    for (const region of regions) {
      jobsByRegion[region] = [];
    }

    // Create monitoring jobs for each monitor in each region
    for (const monitor of monitors) {
      for (const region of regions) {
        const job: MonitorJob = {
          monitorId: monitor.id,
          url: monitor.url,
          method: monitor.method as HTTP_METHOD,
          expectedStatusCodes: Array.isArray(monitor.expectedStatusCodes) 
            ? monitor.expectedStatusCodes 
            : JSON.parse(monitor.expectedStatusCodes || '[200]'),
          timeout: monitor.timeout,
          retries: monitor.retries,
          headers: monitor.headers ? 
            (typeof monitor.headers === 'string' ? JSON.parse(monitor.headers) : monitor.headers) 
            : null,
          body: monitor.body,
          region: region as any,
        };

        jobsByRegion[region].push(job);
      }
    }

    const totalJobs = Object.values(jobsByRegion).reduce((sum, jobs) => sum + jobs.length, 0);
    console.log(`📦 Created ${totalJobs} monitoring jobs across ${regions.length} regions`);

    return jobsByRegion;
  }

  /**
   * Send jobs to SQS queues following uptimeMonitor pattern
   */
  private async sendJobsToSQS(jobsByRegion: Record<string, MonitorJob[]>): Promise<number> {
    let totalJobsSent = 0;
    const sendPromises: Promise<void>[] = [];

    for (const [region, jobs] of Object.entries(jobsByRegion)) {
      if (jobs.length === 0) continue;

      const promise = this.sendJobsToRegionQueue(region, jobs).then(count => {
        totalJobsSent += count;
      });

      sendPromises.push(promise);
    }

    // Wait for all regions to complete
    await Promise.all(sendPromises);
    return totalJobsSent;
  }

  /**
   * Send jobs to a specific region's SQS queue
   */
  private async sendJobsToRegionQueue(region: string, jobs: MonitorJob[]): Promise<number> {
    try {
      const sqsClient = this.sqsClients.get(region);
      const queueUrl = this.regionQueueUrls.get(region);

      if (!sqsClient || !queueUrl) {
        console.error(`SQS client or queue URL not found for region: ${region}`);
        return 0;
      }

      // Send jobs in batches of 10 (SQS batch limit)
      const batchSize = 10;
      let jobsSent = 0;

      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        
        const entries = batch.map((job, index) => ({
          Id: `${job.monitorId}-${region}-${Date.now()}-${index}`,
          MessageBody: JSON.stringify(job),
          DelaySeconds: 0,
        }));

        const params = {
          QueueUrl: queueUrl,
          Entries: entries,
        };

        await sqsClient.sendMessageBatch(params).promise();
        jobsSent += batch.length;

        console.log(`📤 Sent ${batch.length} jobs to ${region} (total: ${jobsSent}/${jobs.length})`);
      }

      return jobsSent;

    } catch (error) {
      console.error(`Error sending jobs to region ${region}:`, {
        error: error.message,
        region,
        jobCount: jobs.length,
      });
      return 0;
    }
  }

  /**
   * Update monitor timestamps to prevent duplicate scheduling
   */
  private async updateMonitorTimestamps(monitors: any[]): Promise<void> {
    try {
      const now = new Date();
      
      // Update all monitors in a single transaction would be ideal, but we'll do individual updates
      const updatePromises = monitors.map(monitor => 
        this.db
          .update(monitors)
          .set({ 
            lastCheckedAt: now,
            updatedAt: now 
          })
          .where(eq(monitors.id, monitor.id))
      );

      await Promise.all(updatePromises);
      console.log(`🕐 Updated timestamps for ${monitors.length} monitors`);

    } catch (error) {
      console.error('Error updating monitor timestamps:', error);
      throw error;
    }
  }

  /**
   * Get scheduler statistics for monitoring
   */
  async getSchedulerStats(): Promise<any> {
    try {
      const activeMonitors = await this.db
        .select({ count: count() })
        .from(monitors)
        .where(
          and(
            eq(monitors.isActive, true),
            eq(monitors.isDeleted, false)
          )
        );

      const recentlyCheckedMonitors = await this.db
        .select({ count: count() })
        .from(monitors)
        .where(
          and(
            eq(monitors.isActive, true),
            eq(monitors.isDeleted, false),
            gte(monitors.lastCheckedAt, new Date(Date.now() - 10 * 60 * 1000)) // Last 10 minutes
          )
        );

      return {
        activeMonitors: activeMonitors[0]?.count || 0,
        recentlyCheckedMonitors: recentlyCheckedMonitors[0]?.count || 0,
        regions: Array.from(this.sqsClients.keys()),
        lastSchedulerRun: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error getting scheduler stats:', error);
      throw error;
    }
  }

  /**
   * Manual trigger for testing purposes
   */
  async triggerManualScheduling(): Promise<any> {
    console.log('🔧 Manual scheduler trigger initiated...');
    
    try {
      await this.scheduleMonitoringJobs();
      return {
        success: true,
        message: 'Manual scheduling completed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Manual scheduling failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

