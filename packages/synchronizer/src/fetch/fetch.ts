import { utils } from '@muta-extra/common';
import { Client } from '@mutadev/client';
import { defaults, range } from 'lodash';
import { GetReceiptQuery, GetTransactionQuery } from '@mutadev/client-raw';
import { chunkAndBatch } from './batch';

const rawClient = new Client().getRawClient();

/**
 * ```
 * _${index}: getTransaction(txHash: "${txHash}") {
 *    ...transactionKeys
 *  }
 * ```
 * @param txHash
 * @param index
 */
const generateTransactionQuerySegment = (txHash: string, index: number) => `
_${index}: getTransaction(txHash: "${txHash}") {
  ...transactionKeys
}
`;

/**
 * a GraphQL fragment for transaction keys
 * ```graphql
 * fragment transactionKeys on SignedTransaction {
 *    chainId
 *    cyclesLimit
 *    cyclesPrice
 *    method
 *    nonce
 *    payload
 *    pubkey
 *    serviceName
 *    signature
 *    timeout
 *    txHash
 * }
 * ```
 */
export const txFragment = /*GraphQL*/ `
fragment transactionKeys on SignedTransaction {
    chainId
    cyclesLimit
    cyclesPrice
    method
    nonce
    payload
    pubkey
    serviceName
    signature
    timeout
    txHash
}
`;

function fetchIndexedTransaction(
  orderedTransactionHashes: string[],
  concurrency: number,
) {
  return chunkAndBatch<GetTransactionQuery['getTransaction']>({
    taskSource: orderedTransactionHashes,
    fragment: txFragment,
    generateQuerySegment: generateTransactionQuerySegment,
    chunkSize: 200,
    concurrency,
  });
}

const generateReceiptQuerySegment = (txHash: string, index: number) => `
_${index}: getReceipt(txHash: "${txHash}") {
  ...receiptKeys
}
`;

const receiptFragment = `
fragment receiptKeys on Receipt {
    txHash
    height
    cyclesUsed
    events {
      data
      service
    }
    stateRoot
    response {
      serviceName
      method
      response {
        code
        succeedData
        errorMessage
      }
    }
}
`;

async function fetchIndexedReceipt(
  orderedTxHashes: Array<string>,
  concurrency: number,
) {
  return chunkAndBatch<GetReceiptQuery['getReceipt']>({
    generateQuerySegment: generateReceiptQuerySegment,
    fragment: receiptFragment,
    taskSource: orderedTxHashes,
    chunkSize: 200,
    concurrency,
  });
}

interface FetchWholeBlockOptions {
  concurrency: number;
}

export async function fetchWholeBlock(
  height: number,
  options: Partial<FetchWholeBlockOptions> = {},
) {
  const { concurrency } = defaults<
    Partial<FetchWholeBlockOptions>,
    FetchWholeBlockOptions
  >(options, {
    concurrency: 20,
  });

  const block = await rawClient.getBlock({
    height: utils.toHex(height),
  });

  const orderedTxHashes = block.getBlock.orderedTxHashes;

  if (orderedTxHashes.length === 0) {
    return { block: block.getBlock, txs: [], receipts: [] };
  }

  const indexedTransaction = await fetchIndexedTransaction(
    orderedTxHashes,
    concurrency,
  );

  const txs: GetTransactionQuery[] = range(orderedTxHashes.length).map<
    GetTransactionQuery
  >((i: number) => {
    const tx = indexedTransaction[`_${i}`];
    return { getTransaction: tx } as GetTransactionQuery;
  });

  const indexedReceipt = await fetchIndexedReceipt(
    orderedTxHashes,
    concurrency,
  );

  const receipts: GetReceiptQuery[] = range(orderedTxHashes.length).map<
    GetReceiptQuery
  >((i: number) => {
    const receipt = indexedReceipt[`_${i}`];
    return { getReceipt: receipt };
  });

  return {
    block: block.getBlock,
    txs: txs.map((tx) => tx.getTransaction),
    receipts: receipts.map((receipt) => receipt.getReceipt),
  };
}
