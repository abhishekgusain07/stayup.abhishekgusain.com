import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { MonitorService } from './monitor.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { 
  CreateMonitor, 
  UpdateMonitor, 
  createSuccessResponse, 
  createErrorResponse 
} from '../../types/monitoring-types';

@ApiTags('Monitors')
@Controller('monitors')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MonitorController {
  constructor(private monitorService: MonitorService) {}

  @Get()
  @ApiOperation({ summary: 'Get user monitors with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 50)' })
  @ApiResponse({ status: 200, description: 'Monitors retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonitors(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const limitValue = Math.min(50, Math.max(1, limit));
      const pageValue = Math.max(1, page);

      const result = await this.monitorService.getMonitorsByUser(
        req.user.userId,
        pageValue,
        limitValue
      );

      return createSuccessResponse(result);
    } catch (error) {
      console.error('Error fetching monitors:', error);
      return createErrorResponse('Failed to fetch monitors');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific monitor by ID' })
  @ApiParam({ name: 'id', description: 'Monitor ID' })
  @ApiResponse({ status: 200, description: 'Monitor retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonitor(
    @Request() req,
    @Param('id') monitorId: string,
  ) {
    try {
      const monitor = await this.monitorService.getMonitorById(monitorId, req.user.userId);
      return createSuccessResponse(monitor);
    } catch (error) {
      if (error.message === 'Monitor not found') {
        return createErrorResponse('Monitor not found');
      }
      console.error('Error fetching monitor:', error);
      return createErrorResponse('Failed to fetch monitor');
    }
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute following uptimeMonitor rate limiting
  @ApiOperation({ summary: 'Create a new monitor' })
  @ApiResponse({ status: 201, description: 'Monitor created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 403, description: 'Monitor limit reached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createMonitor(
    @Request() req,
    @Body() createMonitorDto: CreateMonitor,
  ) {
    try {
      const monitor = await this.monitorService.createMonitor(
        req.user.userId,
        createMonitorDto,
        req.user.subscription || 'BASIC'
      );

      return createSuccessResponse(monitor, 'Monitor created successfully');
    } catch (error) {
      if (error.message?.includes('Monitor limit reached')) {
        return createErrorResponse(error.message);
      }
      if (error.message?.includes('Validation failed') || error.message?.includes('Slug already exists')) {
        return createErrorResponse(error.message);
      }
      console.error('Error creating monitor:', error);
      return createErrorResponse('Failed to create monitor');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a monitor' })
  @ApiParam({ name: 'id', description: 'Monitor ID' })
  @ApiResponse({ status: 200, description: 'Monitor updated successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMonitor(
    @Request() req,
    @Param('id') monitorId: string,
    @Body() updateMonitorDto: UpdateMonitor,
  ) {
    try {
      const monitor = await this.monitorService.updateMonitor(
        monitorId,
        req.user.userId,
        updateMonitorDto
      );

      return createSuccessResponse(monitor, 'Monitor updated successfully');
    } catch (error) {
      if (error.message === 'Monitor not found') {
        return createErrorResponse('Monitor not found');
      }
      if (error.message?.includes('Validation failed')) {
        return createErrorResponse(error.message);
      }
      console.error('Error updating monitor:', error);
      return createErrorResponse('Failed to update monitor');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a monitor (soft delete)' })
  @ApiParam({ name: 'id', description: 'Monitor ID' })
  @ApiResponse({ status: 200, description: 'Monitor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteMonitor(
    @Request() req,
    @Param('id') monitorId: string,
  ) {
    try {
      await this.monitorService.deleteMonitor(monitorId, req.user.userId);
      return createSuccessResponse(null, 'Monitor deleted successfully');
    } catch (error) {
      if (error.message === 'Monitor not found') {
        return createErrorResponse('Monitor not found');
      }
      console.error('Error deleting monitor:', error);
      return createErrorResponse('Failed to delete monitor');
    }
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle monitor active status' })
  @ApiParam({ name: 'id', description: 'Monitor ID' })
  @ApiResponse({ status: 200, description: 'Monitor status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async toggleMonitorStatus(
    @Request() req,
    @Param('id') monitorId: string,
  ) {
    try {
      const monitor = await this.monitorService.toggleMonitorStatus(monitorId, req.user.userId);
      const statusMessage = monitor.isActive ? 'activated' : 'deactivated';
      
      return createSuccessResponse(
        monitor, 
        `Monitor ${statusMessage} successfully`
      );
    } catch (error) {
      if (error.message === 'Monitor not found') {
        return createErrorResponse('Monitor not found');
      }
      console.error('Error toggling monitor status:', error);
      return createErrorResponse('Failed to toggle monitor status');
    }
  }
}