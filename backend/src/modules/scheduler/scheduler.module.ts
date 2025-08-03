import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";

import { SchedulerService } from "./scheduler.service";
import { MonitorProcessor } from "./monitor.processor";

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: "monitor-jobs",
    }),
  ],
  providers: [SchedulerService, MonitorProcessor],
  exports: [SchedulerService],
})
export class SchedulerModule {}
