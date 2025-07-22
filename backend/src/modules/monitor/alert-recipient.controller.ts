import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { AlertRecipientService } from './alert-recipient.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  CreateAlertRecipient,
  createSuccessResponse,
  createErrorResponse,
} from '@stayup/shared-types';

@ApiTags('Alert Recipients')
@Controller('monitors/:monitorId/alert-recipients')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AlertRecipientController {
  constructor(private alertRecipientService: AlertRecipientService) {}

  @Get()
  @ApiOperation({ summary: 'Get alert recipients for a monitor' })
  @ApiParam({ name: 'monitorId', description: 'Monitor ID' })
  @ApiResponse({ status: 200, description: 'Alert recipients retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  async getAlertRecipients(
    @Request() req,
    @Param('monitorId') monitorId: string,
  ) {
    try {
      const recipients = await this.alertRecipientService.getAlertRecipients(
        monitorId,
        req.user.userId
      );
      return createSuccessResponse(recipients);
    } catch (error) {
      if (error.message === 'Monitor not found') {
        return createErrorResponse('Monitor not found');
      }
      console.error('Error fetching alert recipients:', error);
      return createErrorResponse('Failed to fetch alert recipients');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Add alert recipient to a monitor' })
  @ApiParam({ name: 'monitorId', description: 'Monitor ID' })
  @ApiResponse({ status: 201, description: 'Alert recipient added successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or email already exists' })
  @ApiResponse({ status: 403, description: 'Alert recipient limit reached' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  async createAlertRecipient(
    @Request() req,
    @Param('monitorId') monitorId: string,
    @Body() createAlertRecipientDto: CreateAlertRecipient,
  ) {
    try {
      const recipient = await this.alertRecipientService.createAlertRecipient(
        monitorId,
        req.user.userId,
        { ...createAlertRecipientDto, monitorId },
        req.user.subscription || 'BASIC'
      );

      return createSuccessResponse(
        recipient,
        'Alert recipient added successfully'
      );
    } catch (error) {
      if (error.message === 'Monitor not found') {
        return createErrorResponse('Monitor not found');
      }
      if (error.message?.includes('Alert recipient limit reached')) {
        return createErrorResponse(error.message);
      }
      if (error.message?.includes('email is already configured')) {
        return createErrorResponse(error.message);
      }
      if (error.message?.includes('Validation failed')) {
        return createErrorResponse(error.message);
      }
      console.error('Error creating alert recipient:', error);
      return createErrorResponse('Failed to create alert recipient');
    }
  }

  @Delete(':recipientId')
  @ApiOperation({ summary: 'Remove alert recipient from a monitor' })
  @ApiParam({ name: 'monitorId', description: 'Monitor ID' })
  @ApiParam({ name: 'recipientId', description: 'Alert recipient ID' })
  @ApiResponse({ status: 200, description: 'Alert recipient removed successfully' })
  @ApiResponse({ status: 404, description: 'Monitor or alert recipient not found' })
  async deleteAlertRecipient(
    @Request() req,
    @Param('monitorId') monitorId: string,
    @Param('recipientId') recipientId: string,
  ) {
    try {
      await this.alertRecipientService.deleteAlertRecipient(
        recipientId,
        monitorId,
        req.user.userId
      );

      return createSuccessResponse(null, 'Alert recipient removed successfully');
    } catch (error) {
      if (error.message === 'Monitor not found' || error.message === 'Alert recipient not found') {
        return createErrorResponse(error.message);
      }
      console.error('Error deleting alert recipient:', error);
      return createErrorResponse('Failed to remove alert recipient');
    }
  }

  @Patch(':recipientId/toggle')
  @ApiOperation({ summary: 'Toggle alert recipient status' })
  @ApiParam({ name: 'monitorId', description: 'Monitor ID' })
  @ApiParam({ name: 'recipientId', description: 'Alert recipient ID' })
  @ApiResponse({ status: 200, description: 'Alert recipient status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Monitor or alert recipient not found' })
  async toggleAlertRecipient(
    @Request() req,
    @Param('monitorId') monitorId: string,
    @Param('recipientId') recipientId: string,
  ) {
    try {
      const recipient = await this.alertRecipientService.toggleAlertRecipient(
        recipientId,
        monitorId,
        req.user.userId
      );

      const statusMessage = recipient.isActive ? 'activated' : 'deactivated';
      return createSuccessResponse(
        recipient,
        `Alert recipient ${statusMessage} successfully`
      );
    } catch (error) {
      if (error.message === 'Monitor not found' || error.message === 'Alert recipient not found') {
        return createErrorResponse(error.message);
      }
      console.error('Error toggling alert recipient:', error);
      return createErrorResponse('Failed to toggle alert recipient status');
    }
  }
}