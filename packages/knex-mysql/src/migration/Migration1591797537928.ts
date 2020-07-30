import Knex from 'knex';
import { getKnexInstance, TableNames } from '../';
import { IMigration } from './run';

export class Migration1591797537928 implements IMigration {
  constructor(private knex: Knex = getKnexInstance()) {}

  up() {
    return this.knex.schema
      .createTable(TableNames.BLOCK, (table) => {
        table.increments('id');

        table
          .integer('height')
          .unique('uniq_block_height')
          .comment('The block height');

        table
          .integer('exec_height')
          .notNullable()
          .comment('The executed block height');

        table
          .specificType('block_hash', 'varchar(66) NOT NULL UNIQUE')
          .comment('The block hash');

        table
          .specificType('order_root', 'varchar(66) NOT NULL')
          .comment('Merkle root of ordered transactions');

        table
          .specificType('prev_hash', 'varchar(66) NOT NULL')
          .comment('Prev block hash');

        table.text('proof_bitmap').comment('Proofed bitmap').notNullable();

        table
          .specificType('proof_round', 'varchar(18) NOT NULL')
          .comment('Round usage');

        table
          .specificType('proof_signature', 'varchar(2050) NOT NULL')
          .comment('Aggregated signature of validator set');

        table
          .specificType('proposer', 'varchar(68) NOT NULL')
          .comment('Address of the proposer');

        table
          .specificType('state_root', 'varchar(66) NOT NULL')
          .comment('State merkle root of the block');

        table
          .specificType('timestamp', 'varchar(18) NOT NULL')
          .comment('Block timestamp');

        table
          .integer('transactions_count')
          .notNullable()
          .comment('Number of transactions in the block');

        table
          .specificType('validator_version', 'varchar(18) NOT NULL')
          .comment(
            'When the attributes of the validator set or the validator set change, ' +
              'the validatorVersion will change together',
          );
      })
      .createTable(TableNames.TRANSACTION, (table) => {
        table.bigIncrements('id');

        table
          .integer('block')
          .index('idx_transaction_block')
          .comment('The block height')
          .notNullable();

        table.specificType('chain_id', 'varchar(66) NOT NULL');

        table.specificType('cycles_limit', 'varchar(18) NOT NULL');

        table.specificType('cycles_price', 'varchar(18) NOT NULL');

        table.specificType('sender', 'varchar(68) NOT NULL');

        table.specificType('method', 'varchar(255) NOT NULL');

        table.specificType('nonce', 'varchar(66) NOT NULL');

        table.bigInteger('order').unique('uniq_transaction_order');

        table.specificType('payload', 'LONGTEXT NOT NULL');

        table
          .specificType('pubkey', 'varchar(552) NOT NULL')
          .comment(
            'Signature public keys, ' +
              'it is an RPL-encoded array of public keys, ' +
              'up to 8 public keys in a transaction',
          );

        table.specificType('service_name', 'varchar(1024) NOT NULL');

        table
          .specificType('signature', 'varchar(1128) NOT NULL')
          .comment(
            'it is an RPL-encoded array of Secp256k1 signature, ' +
              'up to 8 signatures in a transaction',
          );

        table.specificType('timeout', 'varchar(18) NOT NULL');

        table
          .specificType('tx_hash', 'varchar(66) NOT NULL')
          .unique('uniq_transaction_tx_hash');
      })
      .createTable(TableNames.RECEIPT, (table) => {
        table.bigIncrements('id');

        table.integer('block').notNullable();

        table.specificType('cycles_used', 'varchar(18) NOT NULL');

        table.boolean('is_error').notNullable();

        table.text('ret').notNullable();

        table
          .specificType('tx_hash', 'varchar(66) NOT NULL')
          .unique('uniq_receipt_tx_hash');
      })
      .createTable(TableNames.EVENT, (table) => {
        table.bigIncrements('id');

        table.text('data').notNullable();

        table.specificType('tx_hash', 'varchar(66) NOT NULL');
        // now index is not necessary, maybe create index after insert
        // .index('idx_event_tx_hash');

        table.specificType('service', 'varchar(255) NOT NULL');
      })
      .createTable(TableNames.BLOCK_VALIDATOR, (table) => {
        table.increments('id');

        table.specificType('pubkey', 'varchar(68) NOT NULL');

        table.integer('propose_weight').notNullable();

        table
          .specificType('version', 'varchar(18) NOT NULL')
          .comment('This field will change when the validator changes');

        table.integer('vote_weight').notNullable();

        table.unique(
          ['pubkey', 'version'],
          'uniq_block_validator_pubkey_version',
        );
      })
      .createTable(TableNames.ACCOUNT, (table) => {
        table.bigIncrements('id');

        table
          .specificType('address', 'varchar(42) NOT NULL')
          .unique('uniq_account_address');
      });
  }

  down() {
    return this.knex.schema
      .dropTableIfExists(TableNames.BLOCK)
      .dropTableIfExists(TableNames.TRANSACTION)
      .dropTableIfExists(TableNames.RECEIPT)
      .dropTableIfExists(TableNames.EVENT)
      .dropTableIfExists(TableNames.BLOCK_VALIDATOR)
      .dropTableIfExists(TableNames.ACCOUNT);
  }
}
