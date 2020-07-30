import { Maybe } from '@muta-extra/common';
import { findMany, FindManyOption, findOne, getKnexInstance, Knex } from '../';
import { CacheWrapper } from './CacheWrapper';

export interface KnexHelperOptions {
  cache: CacheWrapper;
}

export class KnexHelper {
  private readonly knex: Knex;
  private readonly cache: CacheWrapper;

  constructor(knex: Knex = getKnexInstance(), options: KnexHelperOptions) {
    this.knex = knex;
    this.cache = options.cache;
  }

  async findOne<TRecord>(
    tableName: string,
    where: Partial<TRecord>,
  ): Promise<Maybe<TRecord>> {
    return this.cache.get(
      {
        tableName,
        args: where,
      },
      () => findOne(this.knex, tableName, where),
    );
  }

  async findMany<TRecord>(
    tableName: string,
    options: FindManyOption<TRecord>,
  ): Promise<TRecord[]> {
    return this.cache.get(
      {
        tableName,
        args: options,
      },
      () => findMany(this.knex, tableName, options),
    );
  }
}
