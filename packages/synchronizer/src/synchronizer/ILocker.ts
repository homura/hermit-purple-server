export interface ILock {
  updatedAt: number;
  version: number;
  locked: boolean;
}

export interface ILocker {
  initialize(forceUnlock?: boolean): Promise<ILock>;

  getLock(): Promise<ILock | undefined>;

  lock(version: number): Promise<ILock | undefined>;

  unlock(lock: ILock): Promise<ILock | undefined>;

  revert(lock: ILock): Promise<ILock | undefined>;
}
