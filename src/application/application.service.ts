import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { enumStatus } from '../common/enums/applicationStatus.js';

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) { }

  async apply(programId: number, traineeId: number, cvUrl: string) {
    await this.prisma.program.findUniqueOrThrow({
      where: { id: programId }
    })

    try {
      return await this.prisma.$transaction(async(tx) => {
        const result = await tx.program.updateMany({
          where: { id: programId, seats : { gt: 0 }  },
          data: { seats: { decrement: 1 } }
        })

        if (result.count == 0) {
          throw new ConflictException("no seats available");
        }
        return await tx.application.create({
          data : {
            programId , 
            traineeId ,
            cv : cvUrl
          }
        })
      })
    } catch(e){
      if(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"){
        throw new ConflictException('you already applied to this prgram ') ;
      }
      throw e ;
      

    }

  }

  async findAll() {
    return this.prisma.application.findMany({
      include: {
        trainee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        trainee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async cancel(id: number, traineeId: number) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { id },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      if (application.traineeId !== traineeId) {
        throw new ForbiddenException('Not your application');
      }

      if (
        application.status === enumStatus.CANCELLED ||
        application.status === enumStatus.REJECTED
      ) {
        throw new ConflictException('Application is already inactive');
      }

      const updated = await tx.application.update({
        where: { id },
        data: { status: enumStatus.CANCELLED },
      });

      await tx.program.update({
        where: { id: application.programId },
        data: { seats: { increment: 1 } },
      });

      return updated;
    });
  }

  async changeStatus(id: number, status: enumStatus) {
    if (
      status !== enumStatus.ACCEPTED &&
      status !== enumStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Status must be ACCEPTED or REJECTED',
      );
    }

     const application = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      

    return this.prisma.$transaction(async (tx) => {

      const updated = await tx.application.update({
        where : {id} ,
        data : {status : status}
      })

      if(status == enumStatus.REJECTED){
        await tx.program.update({
        where : {id : updated.programId ,
          status : enumStatus.PENDING
        } ,
        data : {seats : {increment : 1}}
      })

      }


      return updated;
    });
  }



}
