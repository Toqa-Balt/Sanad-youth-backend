import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { enumRoles } from '../common/enums/enumRoles.js';
import { Roles } from '../common/decoraters/Roles.decorater.js';
import { CurrentUser } from '../common/decoraters/user.decorater.js';
import { CreateAnnouncementDto } from './dto/create-anouncment.dto.js';
import { AnnouncementsService } from './anouncments.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/guards.roles.js';
import { UpdateAnouncmentDto } from './dto/update-anouncment.dto.js';
@UseGuards(JwtAuthGuard , RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
  ) {}

  @Post()
  @Roles(enumRoles.ADMIN, enumRoles.SUPERVISOR)
  create(
    @Body() body: CreateAnnouncementDto,
    @CurrentUser() user: any,
  ) {
    return this.announcementsService.create(body, user);
  }

@Get('general')
@Roles(enumRoles.ADMIN, enumRoles.SUPERVISOR, enumRoles.TRAINEE)
getGeneralAnnouncements() {
  return this.announcementsService.getGeneralAnnouncements();
}

@Get('private')
getPrivateAnnouncements(@CurrentUser('id') traineeId: number) {
  return this.announcementsService.getPrivateAnnouncements(traineeId);
}


  @Get(':id')
  @Roles(enumRoles.ADMIN, enumRoles.TRAINEE)
  findOne(
    @Param('id') id: number,
    @CurrentUser() user: any,
  ) {
    return this.announcementsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(enumRoles.ADMIN, enumRoles.SUPERVISOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body:UpdateAnouncmentDto ,
    @CurrentUser() user: any,
  ) {
    return this.announcementsService.update(id, body, user);
  }

  @Delete(':id')
  @Roles(enumRoles.ADMIN, enumRoles.SUPERVISOR)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.announcementsService.remove(id, user);
  }
}