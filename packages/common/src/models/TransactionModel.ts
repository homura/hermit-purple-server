import { Address, Bytes, Hash, Uint64 } from "@mutajs/types";

export interface TransactionModel {
  order: number;
  txHash: Hash;
  from: Address;
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
  block: number;
}