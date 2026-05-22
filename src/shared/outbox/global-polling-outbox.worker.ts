// src/shared/outbox/global-polling-outbox.worker.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { OutboxRepository } from './outbox.repository';
import { EventBusPort } from '../events/event-bus.port';

@Injectable()
export class GlobalPollingOutboxWorker
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(GlobalPollingOutboxWorker.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly outboxRepo: OutboxRepository,
    private readonly eventBus: EventBusPort,
  ) {}

  onModuleInit() {
    this.logger.log(
      '🚀 [GlobalWorker] Polling Worker đã kích hoạt (1s/lần)...',
    );
    this.timer = setInterval(async () => {
      await this.scanAndPublishEvents();
    }, 1000);
  }

  private async scanAndPublishEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingEvents = await this.outboxRepo.findMany({
        where: { isProcessed: false },
        take: 20,
        orderBy: { createdAt: 'asc' },
      } as any);

      if (!pendingEvents || pendingEvents.length === 0) return;

      for (const event of pendingEvents as any[]) {
        try {
          await this.eventBus.publish(event.eventName, event.payload);

          await this.outboxRepo.update({
            where: { id: event.id },
            data: { isProcessed: true },
          } as any);
        } catch (publishError) {
          this.logger.error(`❌ Lỗi phát tán event ${event.id}:`, publishError);
        }
      }
    } catch (error) {
      this.logger.error('❌ Lỗi hệ thống khi quét Outbox:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
