import { envStr } from '@muta-extra/common';
import { ConnectionString } from 'connection-string';
import Knex, { MySqlConnectionConfig } from 'knex';
import 'knex-on-duplicate-update';
import { attachOnDuplicateUpdate } from 'knex-on-duplicate-update';

const knexStringcase = require('knex-stringcase');

attachOnDuplicateUpdate();

let defaultKnex: Knex;

export function getKnexInstance(
  connection: string = envStr('HERMIT_DATABASE_URL', ''),
) {
  if (!defaultKnex) {
    const conn = new ConnectionString(connection);
    const mySqlConfig: MySqlConnectionConfig = {
      host: conn.hostname,
      port: conn.port,
      user: conn.user,
      password: conn.password,
      database: conn.path?.[0],
      ...(conn.params ?? {}),
    };

    defaultKnex = Knex(
      knexStringcase({
        client: 'mysql',
        connection: mySqlConfig,
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
  BLOCK = 'block',
  TRANSACTION = 'transaction',
  RECEIPT = 'receipt',
  EVENT = 'event',
  ACCOUNT = 'account',
  BLOCK_VALIDATOR = 'block_validator',
}

export * from './helpers/knex';
export * from './adapters';
export * from './services';
export { KnexHelper } from './helpers/KnexHelper';
export { Knex };
