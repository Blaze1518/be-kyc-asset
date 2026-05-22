// src/shared/outbox/outbox.module.ts
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { GlobalPollingOutboxWorker } from './global-polling-outbox.worker';
import { EventBusPort } from '../events/event-bus.port';
import { LocalEventBusAdapter } from '../events/adapters/local-event-bus.adapter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    OutboxRepository,
    OutboxService,
    GlobalPollingOutboxWorker,

    {
      provide: EventBusPort,
      useClass: LocalEventBusAdapter,
    },
  ],
  exports: [OutboxService, EventBusPort],
})
export class OutboxModule {}
