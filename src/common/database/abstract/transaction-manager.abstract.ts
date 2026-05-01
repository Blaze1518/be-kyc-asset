import { IDatabaseContext } from '../interface/db-context.interface';

export abstract class TransactionManager {
  abstract run<T>(work: (ctx: IDatabaseContext) => Promise<T>): Promise<T>;
}
