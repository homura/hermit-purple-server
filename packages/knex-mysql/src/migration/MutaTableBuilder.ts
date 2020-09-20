import { ColumnBuilder, TableBuilder } from 'knex';
import { defaults } from 'lodash';

interface Options {
  autoIncrement?: boolean;
  bigIncrements?: boolean;
  charset?: string;
  engine?: string;
}

type ExternalBuilder = {
  hash(columnName: string): ColumnBuilder;
  bytes(columnName: string, length?: number): ColumnBuilder;
  u64(columnName: string): ColumnBuilder;
  address(columnName: string, length?: number): ColumnBuilder;
  unfixedText(columnName: string, length?: number): ColumnBuilder;
  stringifyData(columnName: string): ColumnBuilder;
};
type MutaTableBuilder = TableBuilder & ExternalBuilder;

function createExternalBuilder(builder: TableBuilder): ExternalBuilder {
  return {
    hash(columnName: string): ColumnBuilder {
      return builder
        .specificType(columnName, 'varchar(66)')
        .notNullable()
        .defaultTo('')
        .comment('hash value formatted as 66 length hex');
    },

    bytes(columnName: string, length: number = 1024): ColumnBuilder {
      return builder
        .specificType(columnName, `varchar(${length})`)
        .notNullable()
        .defaultTo('')
        .comment('a value formatted as unknown length hex');
    },

    u64(columnName: string): ColumnBuilder {
      return builder
        .specificType(columnName, `varchar(18)`)
        .notNullable()
        .defaultTo('')
        .comment('a u64 value formatted as 18 length hex');
    },

    address(columnName: string, length = 68): ColumnBuilder {
      return builder
        .specificType(columnName, `varchar(${length})`)
        .notNullable()
        .defaultTo('')
        .comment('an bech32 encoded address value');
    },

    unfixedText(columnName: string, length = 255): ColumnBuilder {
      return builder
        .specificType(columnName, `varchar(${length})`)
        .notNullable()
        .defaultTo('')
        .comment('a text value');
    },

    stringifyData(columnName: string): ColumnBuilder {
      return builder
        .specificType(columnName, 'mediumtext')
        .comment(`stringify data, maybe a JSON string`);
    },
  };
}

export function enhanceBuilder(
  builder: TableBuilder,
  options?: Options,
): MutaTableBuilder {
  const op = defaults<Options | undefined, Required<Options>>(options, {
    autoIncrement: true,
    bigIncrements: false,
    charset: 'utf8',
    engine: 'InnoDB',
  });

  // @ts-ignore
  builder.engine(op.engine);
  // @ts-ignore
  builder.charset(op.charset);

  if (op.bigIncrements) {
    builder.bigIncrements('id').comment('id');
  } else if (op?.autoIncrement) {
    builder.increments('id').comment('id');
  }

  const externalBuilder = createExternalBuilder(builder);

  return new Proxy(builder, {
    get(target, p: string): unknown {
      if (typeof externalBuilder[p as keyof ExternalBuilder] === 'function') {
        return externalBuilder[p as keyof ExternalBuilder].bind(builder);
      }

      return target[p as keyof TableBuilder];
    },
  }) as MutaTableBuilder;
}
