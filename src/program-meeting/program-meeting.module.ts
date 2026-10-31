import { Module } from '@nestjs/common';
import { ProgramMeetingService } from './program-meeting.service.js';
import { ProgramMeetingController } from './program-meeting.controller.js';

@Module({
  controllers: [ProgramMeetingController],
  providers: [ProgramMeetingService],
})
export class ProgramMeetingModule {}
