import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { WebsiteService } from './website.service';

@ApiTags('Public Status Pages')
@Controller('websites')
export class WebsiteController {
  constructor(private websiteService: WebsiteService) {}

  @Get(':slug')
  @ApiParam({ name: 'slug', description: 'Monitor slug for public status page' })
  async getMonitorStatus(@Param('slug') slug: string) {
    // TODO: Implement public status page by slug
    return { success: true, data: {} };
  }
}