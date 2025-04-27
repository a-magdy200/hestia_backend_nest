import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { BypassAuth } from './guards/bypass-auth/bypass-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @BypassAuth()
  getHello(): string {
    return this.appService.getHello();
  }
}
