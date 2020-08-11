import { Hash } from '@mutadev/types';

export interface EventModel {
  service: string;
  data: string;
  name: string;
  txHash: Hash;
}
