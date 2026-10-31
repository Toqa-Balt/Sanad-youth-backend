import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramMeetingDto } from './create-program-meeting.dto.js';

export class UpdateProgramMeetingDto extends PartialType(CreateProgramMeetingDto) {}
