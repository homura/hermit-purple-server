# @muta-extra/knex-mysql

Provide a default database layer implemented by MySQL with knex.

## First Step

### Install

```
npm install -g @muta-extra/knex-mysql
```

### Set Environment Variables

Create a `.env` file like this.

```
HERMIT_DATABASE_URL=mysql://username:password@localhost:3306/muta
```

Or use environment variables directly. Warning for Windows user, we need to use `SET HERMIT_DATABASE_URL=mysql://...` to set variable environments.

###Migration

```
muta-extra-knex-mysql run migrate:up
```

### Rollback

```
muta-extra-knex-mysql run migrate:down
```

## Environment Variables

### HERMIT_DATABASE_URL

A mysql connection url, like `mysql://username:password@localhost:3306/muta`

- type: string
- required: true

### HERMIT_CACHE_URL

A redis connection url like `redis://user:secret@localhost:6379/0?foo=bar&qux=baz`,
checkout [INAN](http://www.iana.org/assignments/uri-schemes/prov/redis) for more information

- type: string
- required: false

## Links

- [SQL schema](./docs/schema.sql)
