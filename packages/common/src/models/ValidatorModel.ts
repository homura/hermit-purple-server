import { Address, Uint64 } from '@mutadev/types';

export interface ValidatorModel {
  address: Address;
  proposeWeight: number;
  voteWeight: number;
  version: Uint64;
}
