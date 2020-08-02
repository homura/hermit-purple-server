import { envStr } from '@muta-extra/hermit-purple';
import { writeFileSync } from 'fs';
import { defaults } from 'lodash';
import { typescriptOfSchema } from 'schemats';

interface Options {
  /**
   * database connection url
   */
  connection: string;
  /**
   * output path
   */
  out: string;
}

export async function generateTSTypesFromMySQL(options?: Partial<Options>) {
  const setting = defaults(options, {
    connection: envStr('HERMIT_DATABASE_URL', ''),
    out: './mysql-types.ts',
  });

  const schema = await typescriptOfSchema(
    setting.connection,
    undefined,
    undefined,
    {
      camelCase: true,
    },
  );
  writeFileSync(setting.out, `// @ts-nocheck \n${schema}`);
  return schema;
}
