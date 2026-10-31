import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProgramMeetingService } from './program-meeting.service.js';
import { CreateProgramMeetingDto } from './dto/create-program-meeting.dto.js';
import { UpdateProgramMeetingDto } from './dto/update-program-meeting.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/guards.roles.js';
import { Roles } from '../common/decoraters/Roles.decorater.js';
import { enumRoles } from '../common/enums/enumRoles.js';
import { CurrentUser } from '../common/decoraters/user.decorater.js';
@UseGuards(JwtAuthGuard , RolesGuard)
@Controller('program-meetings')
export class ProgramMeetingController {
  constructor(private readonly programMeetingService: ProgramMeetingService) {}

@Roles(enumRoles.SUPERVISOR)
  @Post('/:id')
  create(@Param('id') programId : number , @Body() createProgramMeetingDto: CreateProgramMeetingDto) {
    return this.programMeetingService.create(programId , createProgramMeetingDto);
  }

  @Patch(':id')
update(
  @Param('id') id: number,
  @Body() updateProgramMeetingDto: UpdateProgramMeetingDto,
  @CurrentUser() user: any, // بدون 'id' بين القوسين ليمرر كائن الـ user كاملاً مع id و role
) {
  return this.programMeetingService.update(id, updateProgramMeetingDto, user);
}

@Delete(':id')
remove(
  @Param('id') id: number,
  @CurrentUser() user: any,
) {
  return this.programMeetingService.remove(id, user);
}
}
