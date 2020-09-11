import { assert } from '@muta-extra/common';
import { TableNames } from '@muta-extra/knex-mysql';
import { ILock, ILocker } from '@muta-extra/synchronizer';
import Knex from 'knex';
import { defaults } from 'lodash';

export interface LockModel extends ILock {
  id: number;
}

interface LockConfig<Id = unknown> {
  /**
   * extra locker table name
   */
  tableName?: string;

  /**
   * the lock identity, defaults to id: 1
   */
  lockIdentity?: Id;
}

type SyncLockConfig = Required<LockConfig<{ id: 1 }>>;

export class DefaultLocker implements ILocker {
  static getDefaultLockConfig(): SyncLockConfig {
    return {
      tableName: TableNames.SYNC_LOCK,
      lockIdentity: { id: 1 },
    };
  }

  #initialized = false;

  private readonly options: SyncLockConfig;

  constructor(private knex: Knex, options?: LockConfig) {
    this.options = defaults(options, DefaultLocker.getDefaultLockConfig());
  }

  get lockTable() {
    return this.knex<LockModel, LockModel>(this.options.tableName);
  }

  get lockClient() {
    return this.lockTable.where(this.options.lockIdentity);
  }

  getLock(): Promise<LockModel | undefined> {
    return this.lockClient.first();
  }

  async initialize(forceUnlock = false): Promise<LockModel> {
    assert(
      !this.#initialized,
      `DefaultLocker has initialized, re-initialize is invalid`,
    );

    const lock = await this.getLock();

    if (!lock) {
      const freshLock = {
        id: 1,
        version: 1,
        locked: false,
        updatedAt: Date.now(),
      };
      await this.lockTable.insert(freshLock);
      this.#initialized = true;
      return freshLock;
    }

    if (lock.locked) {
      assert(
        forceUnlock,
        'failed to initialize sync, last lock is unreleased, \n' +
          'or you are trying to run multi sync program' +
          ' to see https://github.com/homura/hermit-purple-server/blob/develop/docs/env.md#hermit_force_unlock' +
          ' for more information',
      );
      await this.updateLock({ locked: false });
    }

    this.#initialized = true;
    return { ...lock, locked: false };
  }

  private ensureInitialized(): void {
    assert(
      this.#initialized,
      `DefaultLocker is uninitialized, call initialize first`,
    );
  }

  private async updateLockWithTransaction(
    trx: Knex.Transaction,
    update: Partial<LockModel>,
    where?: Partial<LockModel>,
  ): Promise<LockModel | undefined> {
    const rows = await trx(this.options.tableName)
      .update({ updatedAt: Date.now(), ...update })
      .where({ ...this.options.lockIdentity, ...where });

    if (rows === 0) return undefined;
    if (rows > 1) throw new Error('multi lock found');

    return trx<LockModel>(this.options.tableName)
      .where(this.options.lockIdentity)
      .first();
  }

  private async updateLock(
    update: Partial<LockModel>,
    where?: Partial<LockModel>,
  ): Promise<LockModel | undefined> {
    return this.knex.transaction((trx) =>
      this.updateLockWithTransaction(trx, update, where),
    );
  }

  lock(lockVersion: number): Promise<LockModel | undefined> {
    this.ensureInitialized();

    return this.updateLock(
      { locked: true },
      { locked: false, version: lockVersion },
    );
  }

  async unlock(lock: LockModel): Promise<LockModel | undefined> {
    this.ensureInitialized();

    return this.updateLock(
      { locked: false, version: lock.version + 1 },
      { locked: true, version: lock.version },
    );
  }
}
