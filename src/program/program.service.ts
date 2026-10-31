import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto.js';
import { UpdateProgramDto } from './dto/update-program.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { enumRoles } from '../common/enums/enumRoles.js';

@Injectable()
export class ProgramService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) { }


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

  async create(
    supervisorId: number,
    createProgramDto: CreateProgramDto,
    image: string,
  ) {
    const program =  this.prisma.program.create({
      data: {
        ...createProgramDto,
        supervisorId,
        image,
      },
    });

    const version = (await this.cache.get<number>('programs:version'))?? 1 ;
    await this.cache.set('programs:version' , version+1 , 0) ;

    return program ;
  }

  async findAll(
    page: number,
    limit: number,
    sort: 'asc' | 'desc' = 'asc',
  ) {
    const version = (await this.cache.get<number>('programs:version'))?? 1 ;
    const cacheKey = `programs:v:${version}page:${page}:limit:${limit}:sort:${sort}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log('CACHE HIT');
      return cached;
    }

    console.log('CACHE MISS');

    const programs = await this.prisma.program.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        id: sort,
      },
      omit: {
        supervisorId: true,
      },
      include: {
        meetings: true,
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.cache.set(cacheKey , programs) ;

    return programs ;

    
  }
  async findOne(id: number) {
    const key = `program:${id}`;

    const cached = await this.cache.get(key);

    if (cached) {
      console.log('CACHE HIT');
      return cached;
    }

    console.log('CACHE MISS');

    const program = await this.prisma.program.findUnique({
      where: { id },
      omit: { supervisorId: true },
      include: {
        meetings: true,
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    await this.cache.set(key, program);

    return program;
  }

  async update(programId: number, user: any, updateProgramDto: UpdateProgramDto) {
    const existingProgram = await this.prisma.program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      throw new NotFoundException('Program not found');
    }

    await this.checkProgramAccess(programId, user.id, user.role)

    const updatedProgram = await this.prisma.program.update({
      where: { id: programId },
      data: updateProgramDto,
    });
    const version = (await this.cache.get<number>('programs:version'))?? 1 ;
    await this.cache.set('programs:version' , version+1 , 0) ;

    await this.cache.del(`program:${programId}`);

    return updatedProgram;
  }

  async remove(programId: number, user: any) {
    const existingProgram = await this.prisma.program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      throw new NotFoundException('Program not found');
    }

    await this.checkProgramAccess(programId, user.id, user.role)

    const deletedProgram = await this.prisma.program.delete({
      where: { id: programId },
    });


    const version = (await this.cache.get<number>('programs:version'))?? 1 ;
    await this.cache.set('programs:version' , version+1 , 0) ;
    await this.cache.del(`program:${programId}`);

    return deletedProgram;
  }
}