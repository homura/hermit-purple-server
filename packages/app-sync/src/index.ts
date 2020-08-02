#!/usr/bin/env node
require('@muta-extra/hermit-purple').loadEnvFile();

import { createSynchronizer } from '@muta-extra/hermit-purple';
createSynchronizer().run();
