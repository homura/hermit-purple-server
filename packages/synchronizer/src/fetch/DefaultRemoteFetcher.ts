import { envNum } from '@muta-extra/common';
import { Client } from '@mutadev/client';
import { getSdk } from '@mutadev/client-raw';
import { defaults } from 'lodash';
import { Pool, spawn, Worker } from 'threads';
import { info } from '../logger';
import {
  IFetchRemoteAdapter,
  WholeBlock,
} from '../synchronizer/ISynchronizerAdapter';
import { fetchWholeBlock } from './fetch';

interface FetcherOptions {
  concurrency: number;
  maxPreFetchBlocks: number;
}

export class DefaultRemoteFetcher implements IFetchRemoteAdapter {
  private rawClient: ReturnType<typeof getSdk>;

  private options: FetcherOptions;

  private taskPool: Pool<any>;
  private blockTasks: Map<number, Promise<WholeBlock>> = new Map();

  constructor(
    client: Client = new Client(),
    options?: Partial<FetcherOptions>,
  ) {
    this.rawClient = client.getRawClient();

    this.options = defaults<any, FetcherOptions>(options, {
      concurrency: envNum('HERMIT_FETCH_CONCURRENCY', 20),
      maxPreFetchBlocks: envNum('HERMIT_MAX_PREFETCH_SIZE', 5),
    });

    this.taskPool = Pool(
      () => spawn(new Worker('./fetch.worker')),
      this.options.maxPreFetchBlocks,
    );
  }

  getRemoteBlockHeight = async (): Promise<number> => {
    const block = await this.rawClient.getBlock();
    return Number(block.getBlock.header.height);
  };

  getRemoteBlockExecHeight = async (): Promise<number> => {
    const block = await this.rawClient.getBlock();
    return Number(block.getBlock.header.execHeight);
  };

  private async preFetchRemoteBlocks(fromHeight: number) {
    const remoteHeight = await this.getRemoteBlockExecHeight();

    for (
      let currentPreFetchHeight = fromHeight;
      this.blockTasks.size <= this.options.maxPreFetchBlocks &&
      currentPreFetchHeight <= remoteHeight;
      currentPreFetchHeight++
    ) {
      if (this.blockTasks.has(currentPreFetchHeight)) {
        continue;
      }
      this.blockTasks.set(
        currentPreFetchHeight,
        Promise.resolve(
          this.taskPool.queue<WholeBlock>(async function (
            fetchWholeBlock: IFetchRemoteAdapter['getWholeBlock'],
          ): Promise<WholeBlock> {
            const wholeBlock = await fetchWholeBlock(currentPreFetchHeight);
            info(
              `fetched block: ${currentPreFetchHeight}, transaction: ${wholeBlock.txs.length}`,
            );
            return wholeBlock;
          }),
        ),
      );
    }
  }

  getWholeBlock = async (height: number): Promise<WholeBlock> => {
    // since prefetch probably slower than main thread.
    // Deleting unused tasks to avoid
    this.blockTasks.delete(height - 1);

    // just pre fetch blocks, await is not necessary here
    this.preFetchRemoteBlocks(height + 1);

    if (this.blockTasks.has(height)) {
      const task = this.blockTasks.get(height)!;
      this.blockTasks.delete(height);
      return task;
    }

    return fetchWholeBlock(height);
  };
}
