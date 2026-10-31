import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { enumRoles } from '../enums/enumRoles.js';
import { ROLES_KEY } from '../decoraters/Roles.decorater.js';
@Injectable()
export class RolesGuard implements CanActivate {
constructor(private reflector: Reflector) {}
canActivate(context: ExecutionContext): boolean {
const roles = this.reflector.getAllAndOverride<enumRoles[]>(ROLES_KEY, [
context.getHandler(), // ال method
context.getClass(), // ال controller
]);


if (!roles) return true; 
const { user } = context.switchToHttp().getRequest();

if(user.role  == enumRoles.ADMIN) return true ;

return roles.includes(user?.role);
}
}