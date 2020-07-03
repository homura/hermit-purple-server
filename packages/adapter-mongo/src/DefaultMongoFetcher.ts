import { TransactionModel } from '@muta-extra/common';
import { IFetchLocalAdapter } from '@muta-extra/synchronizer';
import { Db } from 'mongodb';
import { MongoDBHelper, TableNames } from './';

export class DefaultMongoFetcher implements IFetchLocalAdapter {
  private db: Db;

  constructor(private helper: MongoDBHelper) {
    this.db = helper.db();
  }

  getLocalBlockExecHeight = async (): Promise<number> => {
    const collection = this.db.collection(TableNames.Block);
    const [block] = await collection
      .find()
      .sort({ height: -1 })
      .limit(1)
      .toArray();

    return block?.execHeight ?? 0;
  };

  getLocalBlockHeight = async (): Promise<number> => {
    const collection = this.db.collection(TableNames.Block);
    const [block] = await collection
      .find()
      .sort({ height: -1 })
      .limit(1)
      .toArray();

    return block?.height ?? 0;
  };

  getLocalLastTransactionOrder = async (): Promise<number> => {
    const collection = this.db.collection(TableNames.Transaction);
    const [transaction] = await collection
      .find<TransactionModel>()
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    return transaction?.order ?? 0;
  };
}
