import { pageArgs } from '@hermit/server/common/pagination';
import { arg, objectType, queryField } from 'nexus';

export const Transfer = objectType({
  name: 'Transfer',
  definition(t) {
    t.int('id');

    t.int('block');

    t.field('timestamp', {
      type: 'Timestamp',
      description: 'A datetime string format as UTC string',
      async resolve(parent, args, ctx) {
        // TODO
        //  Redundant timestamps to improve performance
        const block = await ctx.dao.block.blockByHeight({
          height: parent.block,
        });
        return block?.timestamp ?? '';
      },
    });

    t.field('transaction', {
      type: 'Transaction',
      nullable: true,
      resolve(parent, args, ctx) {
        return ctx.dao.transaction.byTxHash({ txHash: parent.txHash });
      },
    });

    t.field('value', { type: 'Uint64' });

    t.field('txHash', { type: 'Hash' });

    t.field('from', { type: 'Address' });

    t.field('to', { type: 'Address' });

    t.string('amount');

    t.field('asset', {
      type: 'Asset',
      // TODO
      //  Redundant asset to improve performance
      resolve(parent, args, ctx) {
        return ctx.dao.asset.assetById({ id: parent.asset });
      },
    });
  },
});

export const transferQuery = queryField(t => {
  t.field('transfer', {
    type: Transfer,
    args: {
      txHash: arg({ type: 'Hash' }),
    },
    nullable: true,
    resolve(parent, args, ctx) {
      return ctx.dao.transfer.transferByTxHash({ txHash: args.txHash! });
    },
  });
});

export const transferPagination = queryField(t => {
  t.list.field('transfers', {
    type: 'Transfer',
    args: {
      ...pageArgs,
      fromOrTo: arg({
        type: 'Address',
      }),
      asset: arg({
        type: 'Hash',
      }),
      blockHeight: arg({
        type: 'Int',
      }),
    },
    resolve(parent, args, ctx) {
      return ctx.dao.transfer.transfers({
        pageArgs: args,
        where: {
          fromOrTo: args.fromOrTo!,
          blockHeight: args.blockHeight!,
          assetId: args.asset!,
        },
      });
    },
  });
});
