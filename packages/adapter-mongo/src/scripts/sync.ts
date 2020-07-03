#!/usr/bin/env node
require('@muta-extra/common').loadEnvFile();

import {
  DefaultRemoteFetcher,
  IFetchLocalAdapter,
  IFetchRemoteAdapter,
  ISyncEventHandlerAdapter,
  ISynchronizerAdapter,
  PollingSynchronizer,
} from '@muta-extra/synchronizer';
import {
  DefaultMongoFetcher,
  DefaultMongoSyncEventHandler,
  MongoDBHelper,
} from '../';

async function main() {
  const helper = new MongoDBHelper();
  await helper.connect();

  const remoteFetcher: IFetchRemoteAdapter = new DefaultRemoteFetcher();
  const localFetcher: IFetchLocalAdapter = new DefaultMongoFetcher(helper);
  const eventHandler: ISyncEventHandlerAdapter = new DefaultMongoSyncEventHandler(
    helper,
  );

  const syncAdapter: ISynchronizerAdapter = {
    ...remoteFetcher,
    ...localFetcher,
    ...eventHandler,
  };

  new PollingSynchronizer(syncAdapter).run();
}

main();
