import { BlockModel, logger } from '@muta-extra/common';
import { Executed, ISyncEventHandlerAdapter } from '@muta-extra/synchronizer';
import Knex, { Transaction } from 'knex';
import { getKnexInstance, TableNames } from '../';

const info = logger.childLogger('sync:info');

export class DefaultSyncEventHandler implements ISyncEventHandlerAdapter {
  constructor(protected knex: Knex = getKnexInstance()) {}

  async saveExecutedBlock(trx: Transaction, executed: Executed) {
    await trx<BlockModel>(TableNames.BLOCK).insert(executed.getBlock());
    const transactions = executed.getTransactions();
    const receipts = executed.getReceipts();

    await this.knex
      .batchInsert(TableNames.TRANSACTION, transactions)
      .transacting(trx);
    info(`${transactions.length} transactions prepared`);

    await this.knex.batchInsert(TableNames.RECEIPT, receipts).transacting(trx);
    info(`${receipts.length} receipts prepared`);

    const events = executed.getEvents();
    await this.knex.batchInsert(TableNames.EVENT, events).transacting(trx);
    info(`${events.length} events prepared`);

    for (let validator of executed.getValidators()) {
      await this.knex
        .insert(validator)
        .into(TableNames.BLOCK_VALIDATOR)
        //@ts-ignore
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
