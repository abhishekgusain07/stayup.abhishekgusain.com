import { Module } from '@nestjs/common';
import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';

@Module({
  controllers: [WebsiteController],
  providers: [WebsiteService],
})
export class WebsiteModule {}