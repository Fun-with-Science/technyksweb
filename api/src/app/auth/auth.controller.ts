import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: { email: string; password?: string; name: string; googleId?: string }) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: { email: string; password?: string; googleId?: string }) {
    return this.authService.login(dto);
  }

  @Get('config')
  getPublicConfig() {
    return this.authService.getPublicConfig();
  }

  @Post('google')
  async googleLogin(@Body() dto: { credential: string }) {
    return this.authService.loginWithGoogle(dto.credential);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: { email: string }) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: { token: string; newPassword?: string }) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    return req.user;
  }
}
