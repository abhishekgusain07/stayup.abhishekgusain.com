import { 
  Controller, 
  Post, 
  Get,
  Body, 
  Headers, 
  HttpStatus,
  HttpException,
  UseGuards
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiHeader, 
  ApiResponse,
  ApiExcludeEndpoint 
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { WebhookService } from './webhook.service';
import { createSuccessResponse, createErrorResponse } from '@stayup/shared-types';

/**
 * Custom decorator to mark routes as public (bypass authentication)
 */
export const Public = () => (target: any, key?: any, descriptor?: any) => {
  if (descriptor) {
    Reflect.defineMetadata('isPublic', true, descriptor.value);
  }
  return descriptor;
};

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post('monitor-results')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // Allow high throughput for Lambda workers
  @ApiOperation({ 
    summary: 'Receive monitoring results from Lambda workers',
    description: 'Internal endpoint for Lambda functions to post monitoring results back to the main API'
  })
  @ApiHeader({ 
    name: 'x-api-secret', 
    description: 'Internal API secret for Lambda communication',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Monitoring results processed successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing API secret' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid payload format' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too Many Requests - Rate limit exceeded' 
  })
  async receiveMonitorResults(
    @Body() webhookPayload: any,
    @Headers('x-api-secret') apiSecret: string,
  ) {
    try {
      console.log('Received monitoring results webhook:', {
        hasApiSecret: !!apiSecret,
        payloadSize: JSON.stringify(webhookPayload).length,
        timestamp: new Date().toISOString(),
      });

      // Process the monitoring results
      await this.webhookService.processMonitorResults(webhookPayload, apiSecret);

      return createSuccessResponse(
        { 
          processed: true,
          timestamp: new Date().toISOString()
        },
        'Monitoring results processed successfully'
      );

    } catch (error) {
      console.error('Error processing webhook:', {
        error: error.message,
        stack: error.stack,
        hasApiSecret: !!apiSecret,
      });

      // Handle specific error types
      if (error.name === 'UnauthorizedException') {
        throw new HttpException(
          createErrorResponse('Unauthorized', 'Invalid or missing API secret'),
          HttpStatus.UNAUTHORIZED
        );
      }

      if (error.name === 'ZodError') {
        throw new HttpException(
          createErrorResponse(
            'Invalid payload format', 
            error.errors?.map((e: any) => e.message).join(', ') || 'Validation failed'
          ),
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        createErrorResponse(
          'Internal server error',
          'Failed to process monitoring results'
        ),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @Public()
  @ApiExcludeEndpoint() // Hide from public API docs
  @ApiOperation({ 
    summary: 'Webhook health check',
    description: 'Health check endpoint for monitoring webhook service status'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook service is healthy' 
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Webhook service is unhealthy' 
  })
  async healthCheck() {
    try {
      const health = await this.webhookService.getWebhookHealth();
      
      if (health.status === 'healthy') {
        return createSuccessResponse(health, 'Webhook service is healthy');
      } else {
        throw new HttpException(
          createErrorResponse('Service unhealthy', health.error || 'Webhook service is not functioning properly'),
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    } catch (error) {
      console.error('Health check failed:', error);
      throw new HttpException(
        createErrorResponse('Health check failed', 'Unable to determine service health'),
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Post('test')
  @Public()
  @ApiExcludeEndpoint() // Hide from public API docs - for development only
  @ApiOperation({ 
    summary: 'Test webhook endpoint (Development only)',
    description: 'Test endpoint for validating webhook functionality during development'
  })
  async testWebhook(
    @Body() testPayload: any,
    @Headers('x-api-secret') apiSecret: string,
  ) {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      throw new HttpException(
        createErrorResponse('Not available', 'Test endpoint not available in production'),
        HttpStatus.NOT_FOUND
      );
    }

    try {
      console.log('Test webhook called:', {
        payload: testPayload,
        hasSecret: !!apiSecret,
      });

      return createSuccessResponse(
        {
          received: true,
          payload: testPayload,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
        },
        'Test webhook received successfully'
      );
    } catch (error) {
      throw new HttpException(
        createErrorResponse('Test failed', error.message),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}