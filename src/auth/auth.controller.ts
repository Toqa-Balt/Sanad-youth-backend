import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './Dtos/Login.dto.js';
import { RegisterDto } from './Dtos/register.dto.js';
import { CurrentUser } from '../common/decoraters/user.decorater.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  refresh(@Body() body: { token: string }) {
    return this.authService.refresh(body.token)

  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser('sid') sid: number) {
    return this.authService.logout(sid);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout-others')
  logoutOthers(
    @CurrentUser('id') userId: number,
    @CurrentUser('sid') currentSid: number,
  ) {
    return this.authService.logoutOthers(userId, currentSid);
  }



}