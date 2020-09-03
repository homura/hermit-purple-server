#!/usr/bin/env node
require('@muta-extra/hermit-purple').loadEnvFile();

import { applyAPMMiddleware } from '@muta-extra/apm';
import { createSynchronizer, envNum } from '@muta-extra/hermit-purple';
import express from 'express';

createSynchronizer().run();

// when port is set, the apm will be turned on
const port = envNum('HERMIT_PORT', 0);

if (port) {
  const app = express();
  applyAPMMiddleware(app);
  app.listen(port, () => {
    console.log(`sync started at http://localhost:${port}/metrics`);
  });
}
