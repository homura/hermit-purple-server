import { arg, objectType, queryField } from '@nexus/schema';
import { pageArgs } from './pagination';

export const Transaction = objectType({
  name: 'Transaction',
  definition(t) {
    t.int('order');

    t.int('block');

    t.field('txHash', {
      type: 'Hash',
      description: 'The transaction hash',
    });

    t.string('serviceName', {
      description: 'Represents what `service` does the transaction called ',
    });

    t.string('method', {
      description: 'Represents what `method` does the transaction called ',
    });

    t.string('payload', {
      description: 'Represents what `payload` of the transaction called method',
    });

    t.field('cyclesPrice', {
      type: 'Uint64',
      description: 'Cycles price, similar to the `gasPrice` in eth',
    });

    t.field('cyclesLimit', {
      type: 'Uint64',
      description: 'Cycles price, similar to the `gasLimit` in eth',
    });

    t.field('nonce', {
      type: 'Hash',
      description:
        'A random 32 bytes, the `nonce` in Muta is difference with Ethereum',
    });

    t.field('pubkey', {
      type: 'Bytes',
      description: 'Public key of of a transaction sender',
    });

    t.field('signature', {
      type: 'Bytes',
      description: 'Signature of a transaction',
    });

    t.field('sender', { type: 'Address' });

    t.field('receipt', {
      type: 'Receipt',
      nullable: true,
      resolve(parent, args, ctx) {
        return ctx.receiptService.findByTxHash(parent.txHash)!;
      },
    });
  },
});

export const transactionQuery = queryField((t) => {
  t.field('transaction', {
    type: 'Transaction',
    args: {
      txHash: arg({
        type: 'Hash',
      }),
    },
    nullable: true,
    resolve(parent, args, ctx) {
      if (!args.txHash) return null;
      return ctx.transactionService.findByTxHash(args.txHash);
    },
  });
});

export const transactionPagination = queryField((t) => {
  t.list.field('transactions', {
    type: 'Transaction',
    args: {
      ...pageArgs,
      blockHeight: arg({
        type: 'Int',
      }),
    },

    async resolve(parent, args, ctx) {
      const blockHeight = args.blockHeight;

      if (blockHeight !== null && blockHeight !== undefined) {
        return ctx.transactionService.filterByBlockHeight({
          blockHeight,
          pageArgs: args,
        });
      }

      return ctx.transactionService.filter({ pageArgs: args });
    },
  });
});
