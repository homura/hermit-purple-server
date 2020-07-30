import { utils } from '@muta-extra/common';
import { BatchClient, Client } from '@mutadev/client';
import { defaults } from 'lodash';
import { RawReceipt, RawTransaction } from '../models/types';
import { WholeBlock } from '../synchronizer';

const rawClient = new Client().getRawClient();

interface FetchWholeBlockOptions {
  concurrency: number;
}

export async function fetchWholeBlock(
  height: number,
  options: Partial<FetchWholeBlockOptions> = {},
): Promise<WholeBlock> {
  const { concurrency } = defaults<Partial<FetchWholeBlockOptions>,
    FetchWholeBlockOptions>(options, {
    concurrency: 20,
  });

  const block = await rawClient.getBlock({
    height: utils.toHex(height),
  });

  const orderedTxHashes = block.getBlock!.orderedTxHashes;

  if (orderedTxHashes.length === 0) {
    return { block: block.getBlock!, txs: [], receipts: [] };
  }

  const batch = new BatchClient({ batch: { concurrency } });
  const [txs, receipts] = await Promise.all([
    batch.getTransactions(orderedTxHashes),
    batch.getReceipts(orderedTxHashes),
  ]);

  return {
    block: block.getBlock!,
    txs: txs as RawTransaction[],
    receipts: receipts as RawReceipt[],
  };
}
