import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';


import { enumRoles } from '../common/enums/enumRoles.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';
import { enumStatus } from '../common/enums/applicationStatus.js';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) { }

  private async isAccepted() {

  }

  private async checkProgramAccess(
    programId: number,
    user: any,
  ) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (
      user.role !== enumRoles.ADMIN &&
      program.supervisorId !== user.id
    ) {
      throw new ForbiddenException('Access denied');
    }
  }

  async create(
    dto: CreateMaterialDto,
    file: string,
    user: any,
  ) {
    await this.checkProgramAccess(dto.programId, user);

    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.prisma.material.create({
      data: {
        title: dto.title,
        file: file,
        programId: dto.programId,
      },
    });
  }

  async findAll(programId: number, user: any) {
    const application = await this.prisma.application.findFirst({
      where: {
        traineeId: user.id,
        programId: programId,
      },
    });

    if(user.role != enumRoles.ADMIN && application?.status != 'ACCEPTED')
      throw new ForbiddenException('you are not accepted to this program ')

    return this.prisma.material.findMany({
      where: { programId },
    });
  }

  async findOne(id: number, user: any) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }


    const application = await this.prisma.application.findFirst({
      where: {
        traineeId: user.id,
        programId: material.programId 
      },
    });

     if(user.role != enumRoles.ADMIN && application?.status != 'ACCEPTED')
      throw new ForbiddenException('you are not accepted to this program ')

    return material;
  }

  async update(
    id: number,
    dto: UpdateMaterialDto,
    user: any,
  ) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    await this.checkProgramAccess(material.programId, user);

    return this.prisma.material.update({
      where: { id },
      data: {
        title: dto.title,
      },
    });
  }

  async remove(id: number, user: any) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    await this.checkProgramAccess(material.programId, user);

    return this.prisma.material.delete({
      where: { id },
    });
  }
}