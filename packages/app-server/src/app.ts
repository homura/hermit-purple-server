import {
  envNum,
  extendService,
  makeSchema,
  pluginApolloComplexity,
} from '@muta-extra/hermit-purple';
import { ApolloServer } from 'apollo-server';
import path from 'path';

const schema = makeSchema({
  // default types are bind on makeSchema
  types: {},
  outputs: {
    schema: path.join(__dirname, '../api.graphql'),
  },
});

const server = new ApolloServer({
  plugins: [
    pluginApolloComplexity(schema, {
      fields: ['transactions', 'blocks'],
      defaultListSize: envNum('HERMIT_DEFAULT_LIST_SIZE', 10),
      maxFieldSize: envNum('HERMIT_MAX_COMPLEXITY', 500),
      maxSkipSize: envNum('HERMIT_MAX_SKIP_SIZE', 10000),
    }),
  ],
  schema,
  context: extendService({}),
});

const port = envNum('HERMIT_PORT', 4040);

server.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`,
  ),
);
