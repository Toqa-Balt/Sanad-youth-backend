import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnouncementDto } from './create-anouncment.dto.js';


export class UpdateAnouncmentDto extends PartialType(CreateAnnouncementDto) {}
