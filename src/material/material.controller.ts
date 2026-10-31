import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { MaterialsService } from './material.service.js';
import { UploadFile } from '../common/decoraters/upload_file.decorater.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { CurrentUser } from '../common/decoraters/user.decorater.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/guards.roles.js';
import { Roles } from '../common/decoraters/Roles.decorater.js';
import { enumRoles } from '../common/enums/enumRoles.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) { }
  @Roles(enumRoles.SUPERVISOR)
  @Post()
  @UploadFile({
    fieldName: 'file',
    folder: 'materials',
    allowedTypes: ['application/pdf'],
    maxSizeMB: 10,
  })
  create(
    @Body() dto: CreateMaterialDto,
    @UploadedFile() f: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!f) throw new BadRequestException('File is required');

    const fileUrl = `/uploads/materials/${f.filename}`;

    return this.materialsService.create(dto, fileUrl, user);
  }


  @Get('this-program/:id')
  findAll(
    @Param('id') programId: string,
    @CurrentUser() user: any,
  ) {
    return this.materialsService.findAll(Number(programId), user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.materialsService.findOne(Number(id), user);
  }
  @Roles(enumRoles.SUPERVISOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
    @CurrentUser() user: any,
  ) {
    return this.materialsService.update(Number(id), dto, user);
  }
  @Roles(enumRoles.SUPERVISOR)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.materialsService.remove(Number(id), user);
  }
}