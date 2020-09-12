import { createVersionedCommander } from '@muta-extra/common';
import {
  DefaultLocalFetcher,
  DefaultLocker,
  getKnexInstance,
} from '@muta-extra/knex-mysql';
import { defaults } from 'lodash';
import { Migration001 } from '../migration';
import { IMigration } from '../migration/run';

async function fixLock() {
  const locker = new DefaultLocker(getKnexInstance());
  let lock = await locker.getLock();

  const fetcher = new DefaultLocalFetcher();
  const height = await fetcher.getLocalBlockHeight();

  if (!lock) {
    lock = await locker.initialize();
    console.log('cannot find lock, create new one');
  }

  if (!lock.locked && height === lock.version + 1) {
    console.log(`the lock is fine and doesn't need fixing`);
    process.exit(0);
  }

  await locker.updateLock({ locked: false, version: height + 1 });
  console.log('the lock was fixed');
  process.exit(0);
}

type Thunk<T> = () => T;

interface Options {
  name?: string;
  migrationThunk?: Thunk<IMigration>;
}

const defaultOptions: Required<Options> = {
  name: '',
  migrationThunk: () => new Migration001(),
};

export function createCLI(options?: Options) {
  const op: Required<Options> = defaults(options, defaultOptions);
  const program = createVersionedCommander(__dirname, op.name);

  program
    .command('migrate')
    .description('output MySQL DDL')
    .action(() => {
      console.log(op.migrationThunk().up().toString());
    });

  program
    .command('migrate:up')
    .description('migrate up database')
    .action(async () => {
      await op.migrationThunk().up();
      console.log('tables are created');
      process.exit();
    });

  program
    .command('migrate:down')
    .description('migrate down database')
    .action(async () => {
      await op.migrationThunk().down();
      console.log('tables are dropped');
      process.exit();
    });

  program
    .command('fix:lock')
    .description('fix the sync lock')
    .action(fixLock);

  program.parse(process.argv);
}
