import { Command, createVersionedCommander } from '@muta-extra/common';
import { Knex } from '..';

export interface IMigration {
  up(): Knex.SchemaBuilder;

  down(): Knex.SchemaBuilder;
}

export function createMigration(migration: IMigration): Command {
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
