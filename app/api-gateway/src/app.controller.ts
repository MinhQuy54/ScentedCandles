import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/core/auth/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Check health status of Database, Redis, and AI Engine' })
  getHealth() {
    return this.appService.getHealthCheck();
  }
}
