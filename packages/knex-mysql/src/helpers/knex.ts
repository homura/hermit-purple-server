import { Maybe, NullablePromise } from '@muta-extra/common';
import { PageArgs } from '@muta-extra/nexus-schema';
import Knex, { QueryBuilder } from 'knex';
import { identity, orderBy as _orderBy, pickBy } from 'lodash';

export function findOne<TRecord extends {} = any>(
  knex: Knex,
  tableName: string,
  where: Partial<TRecord>,
): NullablePromise<TRecord> {
  return knex<TRecord>(tableName).where(where).first() as Promise<
    Maybe<TRecord>
  >;
}

export interface FindManyOption<TRecord extends {} = any> {
  page?: PageArgs;
  where?:
    | Partial<TRecord>
    | ((builder: QueryBuilder<TRecord>) => QueryBuilder<TRecord>);
  orderBy?: [keyof TRecord, ('asc' | 'desc')?];
}

export function buildManyQuery<TRecord extends {} = any>(
  knex: Knex,
  tableName: string,
  options: FindManyOption<TRecord>,
): QueryBuilder<TRecord> {
  const { where, page, orderBy } = options;
  const { first, last, skip } = page || {};

  const limit = first || last || 10;

  const offset = skip ?? 0;

  let builder = knex<TRecord>(tableName).limit(limit).offset(offset);

  if (where) {
    if (typeof where === 'function') {
      builder = where(builder);
    } else {
      builder = builder.where(pickBy(where, identity));
    }
  }

  const [orderKey, orderOfKey] = orderBy || [];

  if (!orderKey) return builder;

  if (last) {
    builder = builder.orderBy(orderKey, orderOfKey === 'desc' ? 'asc' : 'desc');
  } else {
    builder = builder.orderBy(orderKey, orderOfKey);
  }

  return builder;
}

export async function findMany<TRecord extends {} = any>(
  knex: Knex,
  tableName: string,
  options: FindManyOption<TRecord>,
): Promise<TRecord[]> {
  const data = await buildManyQuery(knex, tableName, options);

  const orderBy = options.orderBy;
  const [orderKey, orderOfKey] = orderBy || [];

  if (!orderKey) return data;
  return _orderBy(data, orderKey, orderOfKey ?? 'desc');
}
