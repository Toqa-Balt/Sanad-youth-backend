import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { SeedModule } from './seed/seed.module.js';
import { UserModule } from './user/user.module.js';
import { ProgramModule } from './program/program.module.js';
import { ProgramMeetingModule } from './program-meeting/program-meeting.module.js';
import { CacheModule } from '@nestjs/cache-manager';
import { ApplicationModule } from './application/application.module.js';
import { MaterialModule } from './material/material.module.js';
import { AnouncmentsModule } from './anouncments/anouncments.module.js';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 50 }]),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 10_000 }) ,
    PrismaModule,
    UserModule,
    AuthModule,
    SeedModule,
    ProgramModule,
    ProgramMeetingModule,
    ApplicationModule,
    MaterialModule,
    AnouncmentsModule
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
