import { Command, createVersionedCommander } from '@muta-extra/common';
import { Db } from 'mongodb';
import { TableNames } from '../constants';
import { MongoDBHelper } from '../MongoDBHelper';

export class Migration001 {
  private readonly db: Db;

  constructor(private helper: MongoDBHelper) {
    this.db = helper.db();
  }

  async up() {
    const db = this.db;
    await db.createIndex(TableNames.Block, 'height', {
      unique: true,
    });
    await db.createIndex(TableNames.Block, 'blockHash');

    await db.createIndex(TableNames.Transaction, 'block');
    await db.createIndex(TableNames.Transaction, 'txHash', {
      unique: true,
    });
    await db.createIndex(TableNames.Transaction, 'order', {
      unique: true,
    });

    await db.createIndex(TableNames.Receipt, 'txHash', {
      unique: true,
    });

    await db.createIndex(TableNames.Event, 'txHash');
  }

  async down() {
    const db = this.db;
    await db.collection(TableNames.Block).drop();
    await db.collection(TableNames.Transaction).drop();
    await db.collection(TableNames.Receipt).drop();
    await db.collection(TableNames.Event).drop();
  }
}

export function createRunnableMigrate(migration: Migration001): Command {
  async function runMigration(cmd: string) {
    if (!cmd.startsWith('migration')) {
      console.error(`try to run migration`);
      process.exit(1);
      return;
    }

    if (cmd === 'migration:up') {
      await migration.up();
      console.log('tables are crated');
      return;
    } else if (cmd === 'migration:down') {
      await migration.down();
      console.log('tables are dropped');
      return;
    }

    console.log(migration.up().toString());
  }

  const program = createVersionedCommander();

  program
    .command('run <command>')
    .action((cmd) => runMigration(cmd).then(() => process.exit()));
  program.parse(process.argv);

  return program;
}
