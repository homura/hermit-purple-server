import { Address, Bytes, Hash, Uint64 } from '@mutadev/types';

export interface TransactionModel {
  sequence: number;
  txHash: Hash;
  sender: Address;
  serviceName: string;
  method: string;
  payload: string;
  cyclesPrice: Uint64;
  cyclesLimit: Uint64;
  nonce: Hash;
  pubkey: Bytes;
  signature: Bytes;
  chainId: Hash;
  timeout: Uint64;
  blockHeight: number;
}
