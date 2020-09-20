export interface ILock {
  updatedAt: number;
  version: number;
  isLocked: boolean;
}

export interface ILocker {
  /**
   * initialize the locker
   */
  initialize(): Promise<ILock>;

  /**
   * get the lock
   */
  getLock(): Promise<ILock | undefined>;

  /**
   * lock the version
   */
  lock(version: number): Promise<ILock | undefined>;

  /**
   * unlock the version **and goto next version**
   */
  unlock(lock: ILock): Promise<ILock | undefined>;

  /**
   * force unlock, and goto a specified version, this method can be called when
   * the lock cannot be release
   */
  forceUnlock(version: number): Promise<void>;

  /**
   * like unlock, but keeps the current version, this method is usually
   * called when the task fails and the lock needs to be returned.
   */
  revert(lock: ILock): Promise<ILock | undefined>;
}
