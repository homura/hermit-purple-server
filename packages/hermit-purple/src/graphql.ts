import {
  makeSchema as nexusMakeSchema,
  schemas,
} from '@muta-extra/nexus-schema';

type Param<T> = T extends (x: infer P) => infer X ? P : never;
type MakeSchema = typeof nexusMakeSchema;

export function makeSchema(config: Param<MakeSchema>): ReturnType<MakeSchema> {
  return nexusMakeSchema({
    ...config,
    types: {
      ...schemas,
      ...(config.types ?? {}),
    },
  });
}
