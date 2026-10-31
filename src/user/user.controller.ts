import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CurrentUser } from '../common/decoraters/user.decorater.js';
import { RegisterDto } from '../auth/Dtos/register.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/guards.roles.js';
import { Roles } from '../common/decoraters/Roles.decorater.js';
import { enumRoles } from '../common/enums/enumRoles.js';
@UseGuards(JwtAuthGuard , RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

@Roles(enumRoles.ADMIN)
  @Post()
  create(@Body() body : RegisterDto) {
    return this.userService.createSupervisor(body);
  }
@Roles(enumRoles.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
@Roles(enumRoles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
@Roles(enumRoles.SUPERVISOR , enumRoles.TRAINEE)
  @Patch()
  update(@CurrentUser('id') id : number , @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateMe(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
