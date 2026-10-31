import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile } from '@nestjs/common';
import { ApplicationService } from './application.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/guards.roles.js';
import { CurrentUser } from '../common/decoraters/user.decorater.js';
import { UploadFile } from '../common/decoraters/upload_file.decorater.js';
import { Roles } from '../common/decoraters/Roles.decorater.js';
import { enumRoles } from '../common/enums/enumRoles.js';
import { enumStatus } from '../common/enums/applicationStatus.js';

@UseGuards(JwtAuthGuard, RolesGuard)
 @Roles(enumRoles.ADMIN)
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }
  @UploadFile({
    fieldName: 'cv',
    folder: 'applications',
    allowedTypes: ['application/pdf'],
    maxSizeMB: 10
  })
  @Roles(enumRoles.TRAINEE)
  @Post('/:id')
  create(@Param('id') programId: number,
    @CurrentUser('id') traineeId: number,
    @UploadedFile() cv: Express.Multer.File
  ) {
    const cvUrl = `/uploads/applications/${cv.filename}` ;
    return this.applicationService.apply(programId, traineeId  , cvUrl);
  }

  @Get()
  findAll() {
    return this.applicationService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.applicationService.findOne(Number(id));
  }

  @Patch(':id/cancel')
  @Roles(enumRoles.TRAINEE)
  cancel(
    @Param('id') appId: string,
    @CurrentUser('id') traineeId: number,
  ) {
    return this.applicationService.cancel(Number(appId), traineeId);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: enumStatus,
  ) {
    return this.applicationService.changeStatus(Number(id), status);
  }
}
