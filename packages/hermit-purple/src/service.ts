import { DefaultService } from '@muta-extra/knex-mysql';
import { IService } from '@muta-extra/nexus-schema';

export function extendService<S>(extend?: S): IService & S {
  const service = new DefaultService();
  return {
    blockService: service.blockService,
    receiptService: service.receiptService,
    transactionService: service.transactionService,
    validatorService: service.validatorService,
    ...(extend ?? {}),
  } as IService & S;
}
