import { Module } from '@nestjs/common';
import { PortsService } from './ports.service';
import { PortsController } from './ports.controller';
import { PortsRepository } from '../ports/repositories/ports.repository';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [DepartmentsModule],
  controllers: [PortsController],
  providers: [PortsService, PortsRepository],
  exports: [PortsService],
})
export class PortsModule {}
