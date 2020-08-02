#!/usr/bin/env node
require('@muta-extra/common').loadEnvFile();

import { Migration001 } from '../migration/Migration001';
import { createMigration } from '../migration/run';

createMigration(new Migration001());
