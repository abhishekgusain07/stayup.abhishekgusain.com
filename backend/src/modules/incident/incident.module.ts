import { Module } from "@nestjs/common";
import { IncidentController } from "./incident.controller";
import { IncidentService } from "./incident.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [IncidentController],
  providers: [IncidentService],
  exports: [IncidentService],
})
export class IncidentModule {}
