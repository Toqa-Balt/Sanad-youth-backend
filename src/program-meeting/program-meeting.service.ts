import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramMeetingDto } from './dto/create-program-meeting.dto.js';
import { UpdateProgramMeetingDto } from './dto/update-program-meeting.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { enumRoles } from '../common/enums/enumRoles.js';

@Injectable()
export class ProgramMeetingService {
  constructor(private readonly prisma: PrismaService) { }

  private async checkProgramAccess(
      id: number,
      userId: number,
      role: enumRoles,
    ) {
      const program = await this.prisma.program.findUnique({
        where: { id },
      });
  
      if (!program) {
        throw new NotFoundException('Program not found');
      }
  
      if (
        role != enumRoles.ADMIN &&
        program.supervisorId != userId
      ) {
        throw new ForbiddenException(
          'You cannot manage another supervisor program',
        );
      }
  
      return program;
    }

  async create(programId: number, createProgramMeetingDto: CreateProgramMeetingDto) {

    return this.prisma.programMeeting.create({
      data: {
        ...createProgramMeetingDto,
        date: new Date(createProgramMeetingDto.date),
        programId: programId,
      },
    });
  }

  async update(id: number, dto: UpdateProgramMeetingDto, user: any) {
    const meeting = await this.prisma.programMeeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    await this.checkProgramAccess(meeting.programId, user.id, user.role);

    return this.prisma.programMeeting.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, user: any) {
    const meeting = await this.prisma.programMeeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    await this.checkProgramAccess(meeting.programId, user.id, user.role);

    return this.prisma.programMeeting.delete({
      where: { id },
    });
  }
}
