import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WhitelistIpService } from './whitelist-ip.service';
import { CreateWhitelistIpDto } from './dto/create-whitelist-ip.dto';
import { UpdateWhitelistIpDto } from './dto/update-whitelist-ip.dto';

@Controller('whitelist-ip')
export class WhitelistIpController {
  constructor(private readonly whitelistIpService: WhitelistIpService) {}

  @Post()
  create(@Body() createWhitelistIpDto: CreateWhitelistIpDto) {
    return this.whitelistIpService.create(createWhitelistIpDto);
  }

  @Get()
  findAll() {
    return this.whitelistIpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.whitelistIpService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWhitelistIpDto: UpdateWhitelistIpDto) {
    return this.whitelistIpService.update(+id, updateWhitelistIpDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.whitelistIpService.remove(+id);
  }
}
