import { envStr } from '@muta-extra/common';
import { ConnectionString } from 'connection-string';
import { Collection, Db, DbCollectionOptions, MongoClient } from 'mongodb';

interface Options {
  connection: string;
}

/**
 * make sure use it after await {@link connect}
 * @example
 * ```js
 * const helper = new MongoHelper({connection: 'mongodb://localhost:27017'});
 * await helper.connect();
 *
 * helper.collection('my_collection')
 * ...
 * ```
 */
export class MongoDBHelper {
  /**
   * because of MongoClient need to await for connecting,
   * make sure use it after await {@link connect}()
   * @private
   */
  private _client!: MongoClient;

  private _db!: Db;

  private readonly options: Options;

  constructor(options?: Partial<Options>) {
    this.options = Object.assign<Options, Partial<Options>>(
      {
        connection: envStr(
          'HERMIT_DATABASE_URL',
          'mongodb://localhost:27017/muta',
        ),
      },
      options || {},
    );
  }

  async connect(
    connectionString: string = this.options.connection,
  ): Promise<this> {
    const conn = new ConnectionString(connectionString);

    const dbName = conn.path?.[0];
    if (!dbName) {
      throw new Error(`database name is required by ${this.constructor.name}, 
      try new MongoDBHelper({ connection: 'mongodb://localhost:27017/some_db' })`);
    }

    this._client = await MongoClient.connect(conn.toString(), {
      useUnifiedTopology: true,
    });
    this._db = this._client.db(dbName);
    return this;
  }

  db: MongoClient['db'] = (name, options) => {
    if (name) return this._client.db(name, options);
    return this._db;
  };

  collection = <T>(
    name: string,
    options?: DbCollectionOptions,
  ): Collection<T> => {
    if (!options) return this._db.collection(name);
    return this._db.collection(name, options);
  };
}
