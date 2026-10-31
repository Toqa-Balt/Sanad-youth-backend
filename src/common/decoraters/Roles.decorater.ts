import { SetMetadata } from '@nestjs/common';
import { enumRoles } from '../enums/enumRoles.js';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: enumRoles[]) => SetMetadata(ROLES_KEY, roles);