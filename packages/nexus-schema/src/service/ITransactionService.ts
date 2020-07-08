import { TransactionModel } from '@muta-extra/common';
import { Hash } from '@mutadev/types';
import { QueryManyFn, QueryOneFn } from '../types';

export interface ITransactionService {
  findByTxHash: QueryOneFn<TransactionModel, Hash>;

  filter: QueryManyFn<TransactionModel>;

  filterByBlockHeight: QueryManyFn<TransactionModel, { blockHeight: number }>;
}
