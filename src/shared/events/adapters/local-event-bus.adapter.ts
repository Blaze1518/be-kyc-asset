import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBusPort } from '../event-bus.port';

@Injectable()
export class LocalEventBusAdapter extends EventBusPort {
  private readonly logger = new Logger(LocalEventBusAdapter.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async publish(eventName: string, payload: any): Promise<void> {
    await this.eventEmitter.emitAsync(eventName, payload);
    this.logger.log(`[EventBus] 📢 Monolith RAM Emit -> ${eventName}`);
  }
}
