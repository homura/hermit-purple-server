import { Hash, Uint64 } from '@mutadev/types';

export interface ReceiptModel {
  blockHeight: number;
  txHash: Hash;
  isError: boolean;
  ret: string;
  cyclesUsed: Uint64;
}
