import { envStr } from '@muta-extra/common';
import { ConnectionString } from 'connection-string';
import { Collection, Db, MongoClient } from 'mongodb';

const conn = new ConnectionString(
  envStr('HERMIT_DATABASE_URL', 'mongodb://localhost:27017'),
);
let client: MongoClient;

export async function getDefaultMongoClient(): Promise<MongoClient> {
  if (!client) {
    return MongoClient.connect(conn.toString(), { useUnifiedTopology: true });
  }

  return client;
}

const defaultDBName = conn.path?.[0] ?? 'muta';

export async function dbOf(
  name: string = defaultDBName,
  client: MongoClient | Promise<MongoClient> = getDefaultMongoClient(),
): Promise<Db> {
  return Promise.resolve(client).then((client) => client.db(name));
}

export function collectionOf<T>(
  name: string,
  db: Promise<Db> | Db = dbOf(),
): Promise<Collection<T>> {
  return Promise.resolve(db).then((db) => db.collection(name));
}
