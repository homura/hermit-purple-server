import { envNum, extendService, makeSchema } from '@muta-extra/hermit-purple';
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
  schema,
  context: extendService({}),
});

const port = envNum('HERMIT_PORT', 4040);

server.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`,
  ),
);
