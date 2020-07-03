#!/usr/bin/env node
require('@muta-extra/common').loadEnvFile();

import { MongoDBHelper } from '../';
import { createRunnableMigrate, Migration001 } from '../migration/Migration001';

async function main() {
  const helper = new MongoDBHelper();
  await helper.connect();
  createRunnableMigrate(new Migration001(helper));
}

main();
