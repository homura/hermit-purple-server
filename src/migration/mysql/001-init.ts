import Knex = require('knex');
import {
  ACCOUNT,
  BLOCK,
  EVENT,
  RECEIPT,
  TRANSACTION,
  BLOCK_VALIDATOR,
} from '@hermit/impl/db/mysql/constants';

export const upBuilder = (knex: Knex) => {
  return knex.schema
    .createTable(BLOCK, table => {
      table
        .integer('height')
        .primary()
        .comment('The block height');

      table
        .integer('execHeight')
        .notNullable()
        .comment('The executed block height');

      table
        .specificType('blockHash', 'varchar(64) NOT NULL UNIQUE')
        .comment('The block hash');

      table
        .specificType('orderRoot', 'varchar(64) NOT NULL')
        .comment('Merkle root of ordered transactions');

      table
        .specificType('preHash', 'varchar(64) NOT NULL')
        .comment('Prev block hash');

      table
        .text('proofBitmap')
        .comment('Proofed bitmap')
        .notNullable();

      table
        .specificType('proofRound', 'varchar(16) NOT NULL')
        .comment('Round usage');

      table
        .specificType('proofSignature', 'varchar(2048) NOT NULL')
        .comment('Aggregated signature of validator set');

      table
        .specificType('proposer', 'varchar(40) NOT NULL')
        .comment('Address of the proposer');

      table
        .specificType('stateRoot', 'varchar(64) NOT NULL')
        .comment('State merkle root of the block');

      table
        .specificType('timestamp', 'varchar(16) NOT NULL')
        .comment('Block timestamp');

      table
        .integer('transactionsCount')
        .notNullable()
        .comment('Number of transactions in the block');

      table
        .specificType('validatorVersion', 'varchar(16) NOT NULL')
        .comment(
          'When the attributes of the validator set or the validator set change, ' +
            'the validatorVersion will change together',
        );
    })
    .createTable(TRANSACTION, table => {
      table
        .integer('block')
        .index()
        .notNullable();

      table.specificType('chainId', 'varchar(64) NOT NULL');

      table.specificType('cyclesLimit', 'varchar(16) NOT NULL');

      table.specificType('cyclesPrice', 'varchar(16) NOT NULL');

      table.specificType('from', 'varchar(40) NOT NULL');

      table.specificType('method', 'varchar(255) NOT NULL');

      table.specificType('nonce', 'varchar(64) NOT NULL');

      table.bigIncrements('order').primary();

      table.text('payload').notNullable();

      table.specificType('pubkey', 'varchar(66) NOT NULL');

      table.specificType('serviceName', 'varchar(255) NOT NULL');

      table.specificType('signature', 'varchar(128) NOT NULL');

      table.specificType('timeout', 'varchar(16) NOT NULL');

      table.specificType('txHash', 'varchar(64) NOT NULL').index();
    })
    .createTable(RECEIPT, table => {
      table.integer('block').notNullable();

      table.specificType('cyclesUsed', 'varchar(16) NOT NULL');

      table.boolean('isError').notNullable();

      table.text('ret').notNullable();

      table.specificType('txHash', 'varchar(64) NOT NULL').primary();
    })
    .createTable(EVENT, table => {
      table.text('data').notNullable();

      table.bigIncrements('id').primary();

      table.specificType('txHash', 'varchar(64) NOT NULL');

      table.specificType('service', 'varchar(255) NOT NULL');
    })
    .createTable(BLOCK_VALIDATOR, table => {
      table.increments('id');

      table.specificType('address', 'varchar(40) NOT NULL');

      table.integer('proposeWeight').notNullable();

      table
        .specificType('version', 'varchar(16) NOT NULL')
        .comment('This field will change when the validator changes');

      table.integer('voteWeight').notNullable();

      table.unique(['address', 'version']);
    })
    .createTable(ACCOUNT, table => {
      table.specificType('address', 'varchar(40) NOT NULL').primary();
    });
};

export const downBuilder = (knex: Knex) => {
  return knex.schema
    .dropTableIfExists(BLOCK)
    .dropTableIfExists(TRANSACTION)
    .dropTableIfExists(RECEIPT)
    .dropTableIfExists(EVENT)
    .dropTableIfExists(BLOCK_VALIDATOR)
    .dropTableIfExists(ACCOUNT);
};
