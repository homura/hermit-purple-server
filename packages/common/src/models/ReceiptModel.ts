import { Hash, Uint64 } from '@mutadev/types';

export interface ReceiptModel {
  block: number;
  txHash: Hash;
  isError: boolean;
  ret: string;
  cyclesUsed: Uint64;
}
