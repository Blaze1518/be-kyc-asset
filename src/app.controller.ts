import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller({ path: 'ping', version: '1' })
export class AppController {
  @Get()
  @HttpCode(HttpStatus.OK)
  ping(): { message: string } {
    return { message: 'pong' };
  }
}
