#!/usr/bin/env node
require('@muta-extra/common').loadEnvFile();

import {
  DefaultRemoteFetcher,
  IFetchLocalAdapter,
  IFetchRemoteAdapter,
  ISyncEventHandlerAdapter,
  ISynchronizerAdapter,
  PollingSynchronizer,
} from "@muta-extra/synchronizer";
import { DefaultMongoFetcher } from "../DefaultMongoFetcher";
import { DefaultMongoSyncEventHandler } from "../DefaultMongoSyncEventHandler";

const remoteFetcher: IFetchRemoteAdapter = new DefaultRemoteFetcher();
const localFetcher: IFetchLocalAdapter = new DefaultMongoFetcher();
const eventHandler: ISyncEventHandlerAdapter = new DefaultMongoSyncEventHandler();

const syncAdapter: ISynchronizerAdapter = {
  ...remoteFetcher,
  ...localFetcher,
  ...eventHandler,
};

new PollingSynchronizer(syncAdapter).run();
