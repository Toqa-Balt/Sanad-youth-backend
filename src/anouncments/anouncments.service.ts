import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';

import { enumRoles } from '../common/enums/enumRoles.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAnnouncementDto } from './dto/create-anouncment.dto.js';
import { enumStatus } from '../common/enums/applicationStatus.js';
import { UpdateAnouncmentDto } from './dto/update-anouncment.dto.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  async create(d: CreateAnnouncementDto, user: any) {
    if (user.role === enumRoles.ADMIN) {
      if (d.programId != null) {
        throw new BadRequestException(
          'Admin announcements must be general',
        );
      }

      const announcement = await this.prisma.announcement.create({
        data: {
          title: d.title,
          content: d.content,
        },
      });

      await this.cacheManager.del('announcements:general');

      return announcement;
    }

    if (user.role === enumRoles.SUPERVISOR) {
      if (d.programId == null) {
        throw new BadRequestException(
          'Supervisor announcements must belong to a program',
        );
      }

      const program = await this.prisma.program.findUnique({
        where: { id: d.programId },
      });

      if (!program) {
        throw new NotFoundException('Program not found');
      }

      if (program.supervisorId !== user.id) {
        throw new ForbiddenException(
          'You can only announce in your own programs',
        );
      }

      return this.prisma.announcement.create({
        data: d,
      });
    }

    throw new ForbiddenException(
      'Not allowed to create announcements',
    );
  }

  async getGeneralAnnouncements() {
    const key = 'announcements:general';

    const cached = await this.cacheManager.get(key);

    if (cached != null) {
      console.log('CACHE HIT');
      return cached;
    }

    console.log('CACHE MISS');

    const announcements = await this.prisma.announcement.findMany({
      where: { programId: null },
    });

    await this.cacheManager.set(key, announcements);

    return announcements;
  }

  async getPrivateAnnouncements(traineeId: number) {
    return this.prisma.announcement.findMany({
      where: {
        programId: { not: null },
        program: {
          applications: {
            some: {
              traineeId,
              status: enumStatus.ACCEPTED,
            },
          },
        },
      },
    });
  }

  async findOne(id: number, user: any) {
    const key = `announcement: ${ id }`;

    let announcement = await this.cacheManager.get<any>(key);

    if (announcement) {
      console.log('CACHE HIT');
    } else {
      console.log('CACHE MISS');

      announcement = await this.prisma.announcement.findUnique({
        where: { id },
      });

      if (!announcement) {
        throw new NotFoundException('Announcement not found');
      }

      await this.cacheManager.set(key, announcement);
    }

    if (user.role === enumRoles.ADMIN) {
      return announcement;
    }

    if (announcement.programId === null) {
      return announcement;
    }

    if (user.role === enumRoles.SUPERVISOR) {
      const program = await this.prisma.program.findUnique({
        where: { id: announcement.programId },
      });

      if (program?.supervisorId === user.id) {
        return announcement;
      }

      throw new ForbiddenException(
        'Not allowed to view this announcement',
      );
    }

    const application = await this.prisma.application.findFirst({
      where: {
        traineeId: user.id,
        programId: announcement.programId,
        status: enumStatus.ACCEPTED,
      },
    });

    if (!application) {
      throw new ForbiddenException(
        'You are not accepted into this program',
      );
    }
    return announcement;
  }

  async update(
    id: number,
    data: UpdateAnouncmentDto,
    user: any,
  ) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (user.role === enumRoles.SUPERVISOR) {
      if (announcement.programId === null) {
        throw new ForbiddenException(
          'Supervisors cannot update general announcements',
        );
      }

      const program = await this.prisma.program.findUnique({
        where: { id: announcement.programId },
      });

      if (program?.supervisorId !== user.id) {
        throw new ForbiddenException(
          'You can only update announcements in your own programs',
        );
      }
    } else if (user.role !== enumRoles.ADMIN) {
      throw new ForbiddenException(
        'Not allowed to update announcements',
      );
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data,
    });

    await this.cacheManager.del(`announcement: ${ id }`);

    if (announcement.programId === null) {
      await this.cacheManager.del('announcements:general');
    }

    return updated;
  }

  async remove(id: number, user: any) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (user.role === enumRoles.SUPERVISOR) {
      if (announcement.programId === null) {
        throw new ForbiddenException(
          'Supervisors cannot delete general announcements',
        );
      }

      const program = await this.prisma.program.findUnique({
        where: { id: announcement.programId },
      });

      if (program?.supervisorId !== user.id) {
        throw new ForbiddenException(
          'You can only delete announcements in your own programs',
        );
      }
    } else if (user.role !== enumRoles.ADMIN) {
      throw new ForbiddenException(
        'Not allowed to delete announcements',
      );
    }

    const deleted = await this.prisma.announcement.delete({
      where: { id },
    });

    await this.cacheManager.del(`announcement: ${ id }`);

    if (announcement.programId === null) {
      await this.cacheManager.del('announcements:general');
    }

    return deleted;
  }
}