import { Bytes, Uint64 } from '@mutadev/types';

export interface ValidatorModel {
  pubkey: Bytes;
  proposeWeight: number;
  voteWeight: number;
  version: Uint64;
}
