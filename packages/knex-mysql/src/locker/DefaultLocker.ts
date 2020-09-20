import { assert } from '@muta-extra/common';
import { TableNames } from '@muta-extra/knex-mysql';
import { ILock, ILocker } from '@muta-extra/synchronizer';
import Knex from 'knex';
import { defaults, isEmpty } from 'lodash';

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

  async getLock(): Promise<LockModel | undefined> {
    const lock = await this.lockClient.first();
    return isEmpty(lock) ? undefined : lock;
  }

  async initialize(): Promise<LockModel> {
    assert(
      !this.#initialized,
      `DefaultLocker has initialized, re-initialize is invalid`,
    );

    const lock = await this.getLock();

    if (!lock) {
      const freshLock: LockModel = {
        id: 1,
        version: 1,
        isLocked: false,
        updatedAt: Date.now(),
      };
      await this.lockTable.insert(freshLock);
      this.#initialized = true;
      return freshLock;
    }

    assert(
      !lock.isLocked,
      'failed to initialize the locker because of the last lock is unreleased, \n' +
        ' if you are trying to run multi sync program?',
    );

    this.#initialized = true;
    return lock;
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

  async updateLock(
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
      { isLocked: true },
      { isLocked: false, version: lockVersion },
    );
  }

  async unlock(lock: LockModel): Promise<LockModel | undefined> {
    this.ensureInitialized();

    return this.updateLock(
      { isLocked: false, version: lock.version + 1 },
      { isLocked: true, version: lock.version },
    );
  }

  async revert(lock: ILock): Promise<ILock | undefined> {
    this.ensureInitialized();

    return this.updateLock(
      { isLocked: false },
      { isLocked: true, version: lock.version },
    );
  }

  /**
   * fix the lock, be sure to use this method very carefully
   */
  async forceUnlock(localHeight: number = 0) {
    const targetVersion = localHeight + 1;
    let lock = await this.getLock();

    if (!lock) {
      lock = {
        id: 1,
        version: targetVersion,
        isLocked: false,
        updatedAt: Date.now(),
      };
      await this.lockTable.insert(lock);
      return;
    }

    if (!lock.isLocked && targetVersion === lock.version) {
      return;
    }

    await this.updateLock({ isLocked: false, version: targetVersion });
  }
}
