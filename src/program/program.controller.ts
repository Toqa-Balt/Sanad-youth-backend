import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { ProgramService } from './program.service.js';
import { CreateProgramDto } from './dto/create-program.dto.js';
import { UpdateProgramDto } from './dto/update-program.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/guards.roles.js';
import { CurrentUser } from '../common/decoraters/user.decorater.js';
import { Roles } from '../common/decoraters/Roles.decorater.js';
import { enumRoles } from '../common/enums/enumRoles.js';
import { UploadFile } from '../common/decoraters/upload_file.decorater.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) { }
  


  @Roles(enumRoles.SUPERVISOR)
  @UploadFile({
    fieldName: 'image',
    folder: 'programs',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jfif'],
    maxSizeMB: 2
  })
  @Post()
  create(@CurrentUser('id') supervisorId: number,
    @Body() createProgramDto: CreateProgramDto,
    @UploadedFile() file: Express.Multer.File) {

    if (!file) throw new BadRequestException('Image is required');

    const imageUrl = `/uploads/programs/${file.filename}` ;
    return this.programService.create(supervisorId, createProgramDto , imageUrl);
  }

  @Get()
  findAll(@Query('page') page : number = 1 , @Query('limit') limit : number = 10 , @Query('sort') sort : 'asc' | 'desc' = 'asc') {
    return this.programService.findAll(page , limit , sort);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programService.findOne(+id);
  }

  @Roles(enumRoles.SUPERVISOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto ,@CurrentUser() user : any) {
    return this.programService.update(+id,user  ,updateProgramDto );
  }

  @Roles(enumRoles.SUPERVISOR)
  @Delete(':id')
  remove(@Param('id') id: string , @CurrentUser() user  : any ) {
    return this.programService.remove(+id , user );
  }
}
