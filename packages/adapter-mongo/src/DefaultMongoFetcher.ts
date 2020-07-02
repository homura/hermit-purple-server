import { BlockModel, TransactionModel } from '@muta-extra/common';
import { IFetchLocalAdapter } from '@muta-extra/synchronizer';
import { Collection } from 'mongodb';
import { collectionOf } from './';
import { TableNames } from './constants';

export class DefaultMongoFetcher implements IFetchLocalAdapter {
  constructor(
    private blockCollection: Promise<Collection<BlockModel>> = collectionOf<BlockModel>(TableNames.Block),
  ) {
  }

  getLocalBlockExecHeight = async (): Promise<number> => {
    const collection = await this.blockCollection;
    const [block] = await collection
      .find()
      .sort({ height: -1 })
      .limit(1)
      .toArray();

    return block?.execHeight ?? 0;
  };

  getLocalBlockHeight = async (): Promise<number> => {
    const collection = await this.blockCollection;
    const [block] = await collection
      .find()
      .sort({ height: -1 })
      .limit(1)
      .toArray();

    return block?.height ?? 0;
  };

  getLocalLastTransactionOrder = async (): Promise<number> => {
    const collection = await this.blockCollection;
    const [transaction] = await collection
      .find<TransactionModel>()
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    return transaction?.order ?? 0;
  };
}
