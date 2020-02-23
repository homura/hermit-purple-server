import { utils } from 'muta-sdk';

export function compoundBalance(address: string, assetId: string) {
  return utils.keccak(utils.toBuffer(address + assetId)).toString('hex');
}
