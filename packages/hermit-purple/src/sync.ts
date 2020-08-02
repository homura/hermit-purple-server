import {
  DefaultLocalFetcher,
  DefaultSyncEventHandler,
  Knex,
} from '@muta-extra/knex-mysql';
import {
  DefaultRemoteFetcher,
  Executed,
  IFetchLocalAdapter,
  IFetchRemoteAdapter,
  ISynchronizerAdapter,
  PollingSynchronizer,
} from '@muta-extra/synchronizer';

export interface SynchronizerContext {
  knex: Knex;
  trx: Knex.Transaction;
}

export interface SyncAdapterOptions {
  onGenesis?: () => Promise<void>;
  onExecutedSave?: (
    executed: Executed,
    ctx: SynchronizerContext,
  ) => Promise<void>;
}

class ExtendableSyncEventHandler extends DefaultSyncEventHandler {
  #options: SyncAdapterOptions;

  constructor(options?: SyncAdapterOptions) {
    super();
    this.#options = options ?? {};
  }

  onGenesis = async () => {
    this.#options?.onGenesis?.();
  };

  async saveExecutedBlock(
    trx: Knex.Transaction,
    executed: Executed,
  ): Promise<void> {
    await super.saveExecutedBlock(trx, executed);
    await this.#options?.onExecutedSave?.(executed, { knex: super.knex, trx });
  }
}

export function createSynchronizer(options?: Partial<SyncAdapterOptions>) {
  const remoteFetcher: IFetchRemoteAdapter = new DefaultRemoteFetcher();
  const localFetcher: IFetchLocalAdapter = new DefaultLocalFetcher();
  const eventHandler = new ExtendableSyncEventHandler(options);

  const adapter: ISynchronizerAdapter = {
    ...localFetcher,
    ...remoteFetcher,
    ...eventHandler,
  };
  return new PollingSynchronizer(adapter);
}
