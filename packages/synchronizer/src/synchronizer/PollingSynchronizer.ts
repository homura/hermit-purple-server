import {
  c_muta_sync_fetch_seconds,
  c_muta_sync_save_seconds,
  g_muta_sync_fetch_count,
  g_muta_sync_local_height,
  g_muta_sync_remote_height,
  Timer,
} from '@muta-extra/apm';
import { envNum, logger } from '@muta-extra/common';
import { Client } from '@mutadev/muta-sdk';
import { Executed } from '../models/Executed';
import { RawBlock, RawReceipt, RawTransaction } from '../models/types';
import { ISynchronizerAdapter } from './';
import { ILocker } from './ILocker';

interface Options {
  adapter: ISynchronizerAdapter;
  locker: ILocker;
  client: Client;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class PollingSynchronizer {
  /**
   * current local block height
   */
  private localNextHeight: number;

  /**
   * latest remote block height
   */
  private remoteHeight: number;

  private localLastTransactionOrder: number;

  private adapter: ISynchronizerAdapter;

  private readonly locker: ILocker;

  private client: Client;

  constructor(options: Options) {
    this.localNextHeight = 0;
    this.remoteHeight = 0;
    this.localLastTransactionOrder = 0;

    this.adapter = options.adapter;
    this.locker = options.locker;
    this.client = options.client;
  }

  async run() {
    const txCount = await this.refreshLocalTransactionOrder();
    g_muta_sync_fetch_count.labels('transaction').set(txCount);

    // more than one sync programs competing for lock,
    // which may cause locks to not be released properly.
    // so when `HERMIT_FORCE_UNLOCK` is found to be set to a non-zero value
    // the lock is forced to be released.
    if (envNum('HERMIT_FORCE_UNLOCK', 0)) {
      const localHeight = await this.refreshNextTargetHeight() - 1;
      await this.locker.forceUnlock(localHeight);
    }
    await this.locker.initialize();

    while (1) {
      try {
        const localNextHeight = await this.refreshNextTargetHeight();
        g_muta_sync_local_height.labels('height').set(localNextHeight);
        g_muta_sync_local_height.labels('exec_height').set(localNextHeight);

        if (localNextHeight === 1) {
          await this.adapter.onGenesis();
        }

        const remoteHeight = await this.refreshRemoteHeight();
        g_muta_sync_remote_height.labels('exec_height').set(remoteHeight);

        if (localNextHeight >= remoteHeight) {
          logger.info(
            `local height: ${localNextHeight}, remote height: ${remoteHeight}, waiting for remote new block`,
          );
          await this.client.waitForNextNBlock(1);
          continue;
        }

        logger.info(`start: ${localNextHeight}, end: ${remoteHeight} `);

        const fetchTimer = Timer.createAndStart();
        const { block, txs, receipts } = await this.adapter.getWholeBlock(
          localNextHeight,
        );
        c_muta_sync_fetch_seconds.inc(fetchTimer.end());

        const currentLock = await this.locker.lock(localNextHeight);
        if (!currentLock) {
          logger.warn(
            `failed to get lock, seems more than one sync is running`,
          );
          await sleep(50);
          continue;
        }
        const saveTimer = Timer.createAndStart();
        await this.onBlockExecuted(block, txs, receipts).then(
          () => this.locker.unlock(currentLock),
          () => this.locker.revert(currentLock),
        );
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

  private async refreshNextTargetHeight(): Promise<number> {
    this.localNextHeight = (await this.adapter.getLocalBlockHeight()) + 1;
    return this.localNextHeight;
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
