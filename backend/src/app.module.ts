import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { IncidentModule } from './modules/incident/incident.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WebsiteModule } from './modules/website/website.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    // Core configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Task scheduling for cron jobs
    ScheduleModule.forRoot(),

    // Rate limiting following uptimeMonitor security practices
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // requests per ttl
      },
    ]),

    // Redis and Bull for job queues (like uptimeMonitor's SQS pattern)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Core database module
    DatabaseModule,

    // Feature modules following uptimeMonitor structure
    AuthModule,
    MonitorModule,
    IncidentModule,
    DashboardModule,
    WebsiteModule, // Public status pages
    WebhookModule, // For Lambda workers to post results
    SchedulerModule, // Monitor scheduling like uptimeMonitor's runScheduler
    NotificationModule, // Email alerts like uptimeMonitor's incidentNotifier
  ],
})
export class AppModule {}