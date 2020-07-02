#!/usr/bin/env node
require("@muta-extra/common").loadEnvFile();

import { createRunnableMigrate, Migration001 } from "../migration/Migration001";

createRunnableMigrate(new Migration001());
