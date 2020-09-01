#!/usr/bin/env node
require('@muta-extra/hermit-purple').loadEnvFile();

import { hermitRegistry } from '@muta-extra/apm';
import { createSynchronizer, envNum } from '@muta-extra/hermit-purple';
import express from 'express';

createSynchronizer().run();

// when port is set, the apm will be turned on
const port = envNum('HERMIT_PORT', 0);

if (port) {
  const app = express();
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', hermitRegistry.contentType);
    res.end(await hermitRegistry.metrics());
  });
  app.listen(port, () => {
    console.log(`sync started at http://localhost:${port}/metrics`);
  });
}
