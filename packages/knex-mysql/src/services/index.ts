import {
  assert,
  BlockModel,
  envNum,
  envStr,
  info,
  ReceiptModel,
  TransactionModel,
  ValidatorModel,
} from '@muta-extra/common';
import {
  IBlockService,
  IReceiptService,
  IService,
  ITransactionService,
  IValidatorService,
} from '@muta-extra/nexus-schema';
import { caching } from 'cache-manager';
import { getKnexInstance, TableNames } from '../';
import { CacheWrapper } from '../helpers/CacheWrapper';
import { KnexHelper, KnexHelperOptions } from '../helpers/KnexHelper';

const redisStore = require('cache-manager-redis-store');

function getKnexHelperDefaultOptions(): KnexHelperOptions {
  const url = envStr('HERMIT_CACHE_URL', '');

  if (!url) {
    info(`start without cache`);
    return { cache: new CacheWrapper() };
  }

  assert(
    url.startsWith('redis'),
    'HERMIT_CACHE_URL now only supported `redis://...` ',
  );

  const ttl = envNum(
    'HERMIT_CACHE_TTL',
    Math.floor(envNum('MUTA_CONSENSUS_INTERVAL', 3000) / 1000),
  );

  info(`caching with ${url}, ttl: ${ttl}`);
  return {
    cache: new CacheWrapper({
      cacher: caching({ store: redisStore, ttl }),
      ttl,
    }),
  };
}

export class DefaultService implements IService {
  blockService: IBlockService;
  receiptService: IReceiptService;
  transactionService: ITransactionService;
  validatorService: IValidatorService;

  readonly helper: KnexHelper;

  constructor(helper?: KnexHelper) {
    this.helper =
      helper ||
      new KnexHelper(getKnexInstance(), getKnexHelperDefaultOptions());

    const thisHelper = this.helper;

    this.blockService = {
      async findByHash(txHash) {
        return thisHelper.findOne<BlockModel>(TableNames.BLOCK, {
          blockHash: txHash,
        });
      },
      findByHeight(height) {
        return thisHelper.findOne<BlockModel>(TableNames.BLOCK, { height });
      },
      filter(args) {
        return thisHelper.findMany<BlockModel>(TableNames.BLOCK, {
          page: args?.pageArgs,
          orderBy: ['height', 'desc'],
        });
      },
    };

    this.receiptService = {
      findByTxHash(txHash) {
        return thisHelper.findOne<ReceiptModel>(TableNames.RECEIPT, { txHash });
      },
    };
    this.transactionService = {
      findByTxHash(txHash) {
        return thisHelper.findOne<TransactionModel>(TableNames.TRANSACTION, {
          txHash,
        });
      },
      filter(args) {
        return thisHelper.findMany<TransactionModel>(TableNames.TRANSACTION, {
          page: args?.pageArgs,
          orderBy: ['order', 'desc'],
        });
      },
      filterByBlockHeight(args) {
        return thisHelper.findMany<TransactionModel>(TableNames.TRANSACTION, {
          page: args.pageArgs,
          orderBy: ['order', 'desc'],
          where: { block: args.blockHeight },
        });
      },
    };

    this.validatorService = {
      filterByVersion(version) {
        return thisHelper.findMany<ValidatorModel>(TableNames.BLOCK_VALIDATOR, {
          where: { version },
        });
      },
    };
  }
}
