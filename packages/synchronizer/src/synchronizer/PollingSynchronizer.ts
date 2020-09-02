import {
  c_muta_sync_fetch_seconds,
  c_muta_sync_save_seconds,
  g_muta_sync_fetch_count,
  g_muta_sync_local_height,
  g_muta_sync_remote_height,
  Timer,
} from '@muta-extra/apm';
import { logger } from '@muta-extra/common';
import { Client } from '@mutadev/muta-sdk';
import { Executed } from '../models/Executed';
import { RawBlock, RawReceipt, RawTransaction } from '../models/types';
import { ISynchronizerAdapter } from './';

export class PollingSynchronizer {
  /**
   * current local block height
   */
  private localHeight: number;

  /**
   * latest remote block height
   */
  private remoteHeight: number;

  private localLastTransactionOrder: number;

  private adapter: ISynchronizerAdapter;

  constructor(
    adapter: ISynchronizerAdapter,
    private client: Client = new Client(),
  ) {
    this.localHeight = 0;
    this.remoteHeight = 0;
    this.localLastTransactionOrder = 0;

    this.adapter = adapter;
  }

  async run() {
    const txCount = await this.refreshLocalTransactionOrder();
    g_muta_sync_fetch_count.labels('transaction').set(txCount);

    while (1) {
      try {
        const localHeight = await this.refreshLocalHeight();
        g_muta_sync_local_height.labels('height').set(localHeight);
        g_muta_sync_local_height.labels('exec_height').set(localHeight);

        if (localHeight === 1) {
          await this.adapter.onGenesis();
        }

        const remoteHeight = await this.refreshRemoteHeight();
        g_muta_sync_remote_height.labels('exec_height');

        if (localHeight >= remoteHeight) {
          logger.info(
            `local height: ${localHeight}, remote height: ${remoteHeight}, waiting for remote new block`,
          );
          await this.client.waitForNextNBlock(1);
          continue;
        }

        logger.info(`start: ${localHeight}, end: ${remoteHeight} `);

        const fetchTimer = Timer.createAndStart();
        const { block, txs, receipts } = await this.adapter.getWholeBlock(
          localHeight,
        );
        c_muta_sync_fetch_seconds.inc(fetchTimer.end());

        const saveTimer = Timer.createAndStart();
        await this.onBlockExecuted(block, txs, receipts);
        c_muta_sync_save_seconds.inc(saveTimer.end());

        await this.refreshLocalTransactionOrder(block.orderedTxHashes.length);
      } catch (e) {
        logger.error(e);
      }
    }
  }

  private async refreshRemoteHeight(): Promise<number> {
    // TODO split block height and exec height
    this.remoteHeight = await this.adapter.getRemoteBlockExecHeight();
    return this.remoteHeight;
  }

  private async refreshLocalHeight(): Promise<number> {
    this.localHeight = (await this.adapter.getLocalBlockHeight()) + 1;
    return this.localHeight;
  }

  private async refreshLocalTransactionOrder(
    transactionCount: number = 0,
  ): Promise<number> {
    if (!this.localLastTransactionOrder) {
      this.localLastTransactionOrder = await this.adapter.getLocalLastTransactionOrder();
    }
    this.localLastTransactionOrder += transactionCount;
    return this.localLastTransactionOrder;
  }

  private async onBlockExecuted(
    rawBlock: RawBlock,
    transactions: RawTransaction[],
    receipts: RawReceipt[],
  ) {
    await this.adapter.onBlockExecuted(
      new Executed({
        rawBlock,
        rawTransactions: transactions,
        rawReceipts: receipts,
        lastTransactionOrder: this.localLastTransactionOrder,
      }),
    );
  }
}
