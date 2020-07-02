import { BlockModel, TransactionModel } from '@muta-extra/common';
import { IFetchLocalAdapter } from '@muta-extra/synchronizer';
import Knex from 'knex';
import { getKnexInstance, TableNames } from '../';

export class DefaultLocalFetcher implements IFetchLocalAdapter {
  constructor(private knex: Knex = getKnexInstance()) {}

  getLocalBlockHeight = async (): Promise<number> => {
    const block = await this.knex<BlockModel>(TableNames.BLOCK)
      .select('height')
      .orderBy('height', 'desc')
      .limit(1);

    return block[0]?.height ?? 0;
  };

  getLocalBlockExecHeight = async (): Promise<number> => {
    const block = await this.knex<BlockModel>(TableNames.BLOCK)
      .select('execHeight')
      .orderBy('height', 'desc')
      .limit(1);

    return block[0]?.execHeight ?? 0;
  };

  getLocalLastTransactionOrder = async (): Promise<number> => {
    const transaction = await this.knex<TransactionModel>(
      TableNames.TRANSACTION,
    )
      .select('order')
      .orderBy('order', 'desc')
      .limit(1);

    return transaction[0]?.order ?? 0;
  };
}
