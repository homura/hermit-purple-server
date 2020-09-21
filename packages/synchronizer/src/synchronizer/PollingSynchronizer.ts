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
   * the next sync target block height
   */
  private localNextHeight: number;

  /**
   * the last remote block height
   */
  private remoteHeight: number;

  /**
   * the last local transaction sequence
   */
  private transactionSequence: number;

  private adapter: ISynchronizerAdapter;

  private readonly locker: ILocker;

  private client: Client;

  constructor(options: Options) {
    this.localNextHeight = 0;
    this.remoteHeight = 0;
    this.transactionSequence = 0;

    this.adapter = options.adapter;
    this.locker = options.locker;
    this.client = options.client;
  }

  async initialize() {
    this.transactionSequence = await this.adapter.getLocalLastTransactionOrder();

    // more than one sync programs competing for lock,
    // which may cause locks to not be released properly.
    // so when `HERMIT_FORCE_UNLOCK` is found to be set to a non-zero value
    // the lock is forced to be released.
    if (envNum('HERMIT_FORCE_UNLOCK', 0)) {
      const localHeight = (await this.refreshNextTargetHeight()) - 1;
      await this.locker.forceUnlock(localHeight);
    }
    await this.locker.initialize();
  }

  async run() {
    await this.initialize();

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
          async (e: Error) => {
            await this.locker.revert(currentLock);
            return Promise.reject(e);
          },
        );
        c_muta_sync_save_seconds.inc(saveTimer.end());

        await this.refreshTransactionSequence(block.orderedTxHashes.length);
        g_muta_sync_fetch_count
          .labels('transaction')
          .set(this.transactionSequence);
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

  private async refreshTransactionSequence(
    transactionCount: number = 0,
  ): Promise<number> {
    this.transactionSequence += transactionCount;
    return this.transactionSequence;
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
        startSequence: this.transactionSequence,
      }),
    );
  }
}
