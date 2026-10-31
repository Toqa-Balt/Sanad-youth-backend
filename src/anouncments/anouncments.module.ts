import { Module } from '@nestjs/common';
import { AnnouncementsController } from './anouncments.controller.js';
import { AnnouncementsService } from './anouncments.service.js';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnouncmentsModule {}
