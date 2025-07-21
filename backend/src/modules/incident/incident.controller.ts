import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { IncidentService } from './incident.service';

@ApiTags('Incidents')
@Controller('incidents')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class IncidentController {
  constructor(private incidentService: IncidentService) {}

  @Get()
  async getIncidents() {
    // TODO: Implement incident retrieval
    return { success: true, data: [] };
  }
}