import { Injectable } from '@nestjs/common';
import { OutboxRepository } from './outbox.repository';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';

@Injectable()
export class OutboxService {
  constructor(private readonly outboxRepo: OutboxRepository) {}

  async pushEvent(
    aggregateType: string,
    eventName: string,
    payload: any,
    ctx: IDatabaseContext,
  ): Promise<void> {
    await this.outboxRepo.create(
      {
        data: {
          aggregateType,
          eventName,
          payload,
          isProcessed: false,
        },
      },
      ctx,
    );
  }
}
