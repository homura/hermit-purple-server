import {
  BlockModel,
  EventModel,
  logger,
  ReceiptModel,
  TransactionModel,
} from '@muta-extra/common';
import { Executed, ISyncEventHandlerAdapter } from '@muta-extra/synchronizer';
import Knex, { Transaction } from 'knex';
import { getKnexInstance, TableNames } from '../';

export class DefaultSyncEventHandler implements ISyncEventHandlerAdapter {
  constructor(protected knex: Knex = getKnexInstance()) {}

  async saveBlock(trx: Transaction, block: BlockModel) {
    await trx<BlockModel>(TableNames.BLOCK).insert(block);
  }

  async saveTransactions(trx: Transaction, txs: TransactionModel[]) {
    return trx.batchInsert(TableNames.TRANSACTION, txs);
  }

  async saveReceipts(trx: Transaction, receipts: ReceiptModel[]) {
    return trx.batchInsert(TableNames.RECEIPT, receipts);
  }

  async saveEvents(trx: Transaction, events: EventModel[]) {
    return trx.batchInsert(TableNames.EVENT, events);
  }

  async saveExecutedBlock(trx: Transaction, executed: Executed) {
    await this.saveBlock(trx, executed.getBlock());

    const transactions = executed.getTransactions();
    await this.saveTransactions(trx, transactions);
    logger.info(`${transactions.length} transactions prepared`);

    const receipts = executed.getReceipts();
    await this.saveReceipts(trx, receipts);
    logger.info(`${receipts.length} receipts prepared`);

    const events = executed.getEvents();
    await this.saveEvents(trx, events);
    logger.info(`${events.length} events prepared`);

    for (let validator of executed.getValidators()) {
      await this.knex
        .insert(validator)
        .into(TableNames.BLOCK_VALIDATOR)
        .onDuplicateUpdate('pubkey', 'version')
        .transacting(trx);
    }
  }

  onGenesis = async () => {};

  onBlockPackaged = async (): Promise<void> => {};

  onBlockExecuted = async (executed: Executed): Promise<void> => {
    await this.knex.transaction(async (trx) =>
      this.saveExecutedBlock(trx, executed),
    );
  };
}
