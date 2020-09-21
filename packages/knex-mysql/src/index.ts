import { envStr } from '@muta-extra/common';
import { ConnectionString } from 'connection-string';
import Knex, { MySqlConnectionConfig } from 'knex';
import { attachOnDuplicateUpdate } from 'knex-on-duplicate-update';
import { compose } from 'lodash/fp';
import { camelcase, snakecase } from 'stringcase';
import { createReservedKeyTransformer } from './helpers/reserved';

const knexStringcase = require('knex-stringcase');

let defaultKnex: Knex;

export function getKnexInstance(
  connection: string = envStr('HERMIT_DATABASE_URL', ''),
) {
  if (!defaultKnex) {
    attachOnDuplicateUpdate();
    const conn = new ConnectionString(connection);
    const mySqlConfig: MySqlConnectionConfig = {
      host: conn.hostname,
      port: conn.port,
      user: conn.user,
      password: conn.password,
      database: conn.path?.[0],
      ...(conn.params ?? {}),
    };

    const transformer = createReservedKeyTransformer();

    defaultKnex = Knex(
      knexStringcase({
        client: 'mysql',
        connection: mySqlConfig,
        stringcase: compose(snakecase, transformer.toDBField),
        appStringcase: compose(camelcase, transformer.fromDBField),
      }),
    );

    if (!connection) {
      console.warn(
        'No HERMIT_DATABASE_URL provided, try connect to mysql://127.0.0.1:3306/muta',
      );
    }
  }

  return defaultKnex;
}

export enum TableNames {
  BLOCK = 't_block',
  TRANSACTION = 't_transaction',
  RECEIPT = 't_receipt',
  EVENT = 't_event',
  BLOCK_VALIDATOR = 't_block_validator',

  SYNC_LOCK = 't_sync_lock',
}

export * from './helpers/knex';
export * from './adapters';
export * from './locker';
export * from './services';
export { KnexHelper } from './helpers/KnexHelper';
export { Knex };
