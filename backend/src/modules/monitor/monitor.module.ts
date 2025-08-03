import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";

import { MonitorController } from "./monitor.controller";
import { MonitorService } from "./monitor.service";
import { AlertRecipientController } from "./alert-recipient.controller";
import { AlertRecipientService } from "./alert-recipient.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    AuthModule,
    // Bull queue for monitor job scheduling (like uptimeMonitor's SQS)
    BullModule.registerQueue({
      name: "monitor-jobs",
    }),
  ],
  controllers: [MonitorController, AlertRecipientController],
  providers: [MonitorService, AlertRecipientService],
  exports: [MonitorService],
})
export class MonitorModule {}
