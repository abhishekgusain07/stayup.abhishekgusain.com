import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ConfigModule, NotificationModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}