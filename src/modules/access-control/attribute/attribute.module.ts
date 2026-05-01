import { Module } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeController } from './attribute.controller';
import { AttributesRepository } from './repositories/attributes.repository';

@Module({
  controllers: [AttributeController],
  providers: [AttributeService, AttributesRepository],
  exports: [AttributeService],
})
export class AttributeModule {}
