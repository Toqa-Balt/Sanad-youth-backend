import { Module } from '@nestjs/common';
import { MaterialsService } from './material.service.js';
import { MaterialsController } from './material.controller.js';

@Module({
  controllers: [MaterialsController],
  providers: [MaterialsService],
})
export class MaterialModule {}
