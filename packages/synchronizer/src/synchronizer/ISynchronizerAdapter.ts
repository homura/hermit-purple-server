import { Executed } from '../models/Executed';
import { Packaged } from '../models/Packaged';
import { RawBlock, RawReceipt, RawTransaction } from '../models/types';

export interface WholeBlock {
  block: RawBlock;
  txs: RawTransaction[];
  receipts: RawReceipt[];
}

export interface IFetchRemoteAdapter {
  /**
   * fetch remote block height
   */
  getRemoteBlockHeight(): Promise<number>;

  /**
   * fetch remote block executed height
   */
  getRemoteBlockExecHeight(): Promise<number>;

  /**
   * fetch remote block, including all transactions and receipts of transactions
   */
  getWholeBlock(height: number): Promise<WholeBlock>;
}

export interface IFetchLocalAdapter {
  /**
   * get local block height
   */
  getLocalBlockHeight(): Promise<number>;

  /**
   * get local executed block height
   */
  getLocalBlockExecHeight(): Promise<number>;

  getLocalLastTransactionOrder(): Promise<number>;
}

export interface ISyncEventHandlerAdapter {
  /**
   * callback when genesis(block 0)
   */
  onGenesis(): Promise<void>;

  /**
   * callback when block packaged
   */
  onBlockPackaged(packed: Packaged): Promise<void>;

  /**
   * callback when block executed
   */
  onBlockExecuted(executed: Executed): Promise<void>;
}

export type ISynchronizerAdapter = IFetchRemoteAdapter &
  IFetchLocalAdapter &
  ISyncEventHandlerAdapter;
