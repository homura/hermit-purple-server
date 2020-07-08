import { Address, Bytes, Hash, Uint64 } from '@mutadev/types';

export interface BlockModel {
  height: number;
  execHeight: number;
  blockHash: Hash;
  transactionsCount: number;
  prevHash: Hash;
  timestamp: string;
  orderRoot: Hash;
  stateRoot: Hash;
  proposer: Address;
  validatorVersion: Uint64;
  proofRound: Uint64;
  proofSignature: Bytes;
  proofBitmap: Bytes;
}
