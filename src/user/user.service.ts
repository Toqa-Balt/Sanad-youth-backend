import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { enumRoles } from '../common/enums/enumRoles.js';
import { AuthService } from '../auth/auth.service.js';
import { RegisterDto } from '../auth/Dtos/register.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) { }

  async createSupervisor(d: RegisterDto) {
   return  await this.auth.register(d , enumRoles.SUPERVISOR);
  }

  async findAll() {
    return this.prisma.user.findMany({
      omit: { password: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID #${id} not found`);
    }

    return user;
  }

  async updateMe(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: { password: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      omit: { password: true },
    });
  }
}