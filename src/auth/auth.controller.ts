import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { BypassAuth } from 'src/guards/bypass-auth/bypass-auth.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @BypassAuth()
  @Post('login')
  async login(@Body() requestBody: UserLoginDto) {
    return this.authService.login(requestBody);
  }

  @BypassAuth()
  @Post('register')
  async register(@Body() requestBody: CreateUserDto) {
    return this.authService.register(requestBody);
  }
}
