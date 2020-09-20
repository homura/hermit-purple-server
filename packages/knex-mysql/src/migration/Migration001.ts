import Knex from 'knex';
import { getKnexInstance, TableNames } from '../';
import { enhanceBuilder } from './MutaTableBuilder';
import { IMigration } from './run';

export class Migration001 implements IMigration {
  constructor(private knex: Knex = getKnexInstance()) {}

  up() {
    return this.knex.schema
      .createTable(TableNames.BLOCK, (rawBuilder) => {
        const table = enhanceBuilder(rawBuilder);

        table
          .integer('height')
          .unique('uniq_block_height')
          .comment('block height in decimal');

        table.integer('exec_height').comment('exec_height in decimal');

        table.hash('block_hash');

        table.hash('order_root');

        table.hash('prev_hash');

        table.bytes('proof_bitmap');

        table.u64('proof_round');

        table.bytes('proof_signature', 2050);

        table.address('proposer');

        table.hash('state_root');

        table.u64('timestamp');

        table
          .integer('transactions_count')
          .notNullable()
          .comment('Number of transactions in the block');

        table.u64('validator_version');
      })
      .createTable(TableNames.TRANSACTION, (rawBuilder) => {
        const table = enhanceBuilder(rawBuilder, {
          bigIncrements: true,
          charset: 'utf8mb4',
        });

        table
          .integer('block_height')
          .index('idx_transaction_block')
          .comment('The block height')
          .notNullable();

        table.hash('chain_id');

        table.u64('cycles_limit');

        table.u64('cycles_price');

        table.address('sender');

        table.unfixedText('method');

        table.hash('nonce');

        table
          .bigInteger('sequence')
          .unique('uniq_transaction_sequence')
          .comment('transaction sequence number');

        table.stringifyData('payload');

        table.bytes('pubkey', 552);

        table.unfixedText('service_name');

        table
          .bytes('signature', 1128)
          .comment(
            'an RPL-encoded array of Secp256k1 signature, ' +
              'up to 8 signatures in a transaction',
          );

        table.u64('timeout');

        table.hash('tx_hash').unique('uniq_transaction_tx_hash');
      })
      .createTable(TableNames.RECEIPT, (rawBuilder) => {
        const table = enhanceBuilder(rawBuilder, {
          bigIncrements: true,
          charset: 'utf8mb4',
        });

        table.integer('block_height').comment('link to block height');

        table.u64('cycles_used');

        table.boolean('is_error').comment('mark the receipt is error');

        table.stringifyData('ret');

        table.hash('tx_hash').unique('uniq_receipt_tx_hash');
      })
      .createTable(TableNames.EVENT, (rawBuilder) => {
        const table = enhanceBuilder(rawBuilder, { bigIncrements: true });

        table.stringifyData('data');

        table.hash('tx_hash').comment('link to transaction_tx_hash');

        table.unfixedText('service');

        table.unfixedText('name');
      })
      .createTable(TableNames.BLOCK_VALIDATOR, (rawBuilder) => {
        const table = enhanceBuilder(rawBuilder);

        table.bytes('pubkey', 68);

        table.integer('propose_weight').notNullable().comment('propose weight');

        table.u64('version');

        table.integer('vote_weight').notNullable().comment('vote weight');

        table.unique(
          ['pubkey', 'version'],
          'uniq_block_validator_pubkey_version',
        );
      })
      .createTable(TableNames.SYNC_LOCK, (table) => {
        // ensure that only one sync is running at a time

        enhanceBuilder(table);
        table.boolean('is_locked').comment('true if it is locked');
        table.bigInteger('version').comment('version will be +1 when updated');
        table.bigInteger('updated_at').comment('last update since');
      });
  }

  down() {
    return this.knex.schema
      .dropTableIfExists(TableNames.BLOCK)
      .dropTableIfExists(TableNames.TRANSACTION)
      .dropTableIfExists(TableNames.RECEIPT)
      .dropTableIfExists(TableNames.EVENT)
      .dropTableIfExists(TableNames.BLOCK_VALIDATOR)
      .dropTableIfExists(TableNames.SYNC_LOCK);
  }
}
