import { writeFileSync } from 'fs';
import { join } from 'path';
import { typescriptOfSchema } from 'schemats';
import { HERMIT_DATABASE_URL } from '../src/config';

async function main() {
  const schema = await typescriptOfSchema(HERMIT_DATABASE_URL);
  writeFileSync(join(__dirname, '../src/generated/schema.ts'), schema);
  process.exit(0);
}

main();