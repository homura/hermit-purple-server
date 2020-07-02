import { logger } from "@muta-extra/common";
import {
  Executed,
  ISyncEventHandlerAdapter,
  Packaged,
} from "@muta-extra/synchronizer";
import { Db } from "mongodb";
import { dbOf } from "./";
import { TableNames } from "./constants";

const info = logger.childLogger("mongo-adapter:info");

export class DefaultMongoSyncEventHandler implements ISyncEventHandlerAdapter {
  constructor(private db: Promise<Db> = dbOf()) {}

  onBlockExecuted = async (executed: Executed): Promise<void> => {
    const db = await this.db;
    const block = executed.getBlock();

    info(`[block-${block.height}]: start`);
    await db.collection(TableNames.Block).insertOne(block);

    if (block.transactionsCount <= 0) {
      return;
    }

    const events = executed.getEvents();
    const receipts = executed.getReceipts();
    const transactions = executed.getTransactions();

    await Promise.all([
      db
        .collection(TableNames.Transaction)
        .insertMany(transactions, { w: 0 })
        .then(() =>
          info(
            `[block-${block.height}]: ${transactions.length} transactions saved`
          )
        ),
      db
        .collection(TableNames.Receipt)
        .insertMany(receipts, { w: 0 })
        .then(() =>
          info(`[block-${block.height}]: ${receipts.length} receipts saved`)
        ),
      db
        .collection(TableNames.Event)
        .insertMany(events, { w: 0 })
        .then(() =>
          info(`[block-${block.height}]: ${events.length} events saved`)
        ),
    ]);
  };

  onBlockPackaged = async (packed: Packaged): Promise<void> => {};

  onGenesis = async (): Promise<void> => {};
}
