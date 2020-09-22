# Environment Variables

All the [Muta envs](https://github.com/nervosnetwork/muta-sdk-js/tree/master/packages/muta-defaults) are available in this project since this project is dependent on [muta-sdk](https://github.com/nervosnetwork/muta-sdk-js), for example, [MUTA_ENDPOINT](https://github.com/nervosnetwork/muta-sdk-js/tree/master/packages/muta-defaults#muta_endpoint)

## Common Env

### HERMIT_PORT

The modules which is named `app-*` will start a server when running, so they need a port for listening.

- type: number
- default
  - server: 4040
  - sync: 0 (random)

### HERMIT_DATABASE_URL

The database connection URI

- type: string
- default: (empty)

## Sync

### HERMIT_FETCH_CONCURRENCY

The concurrency when sync block data from a Muta instance

- type: number
- default: 50

### HERMIT_FORCE_UNLOCK

To prevent concurrent writes from causing the transaction to be out of order, a lock is necessary.
The lock may warn you when the program exits unexpectedly, or when running multiple sync

-type: 0 | 1
default: 1

### HERMIT_MAX_PREFETCH_SIZE

The max size of a queue which will pre-fetch unsynced block

- type: number
- default: 4

## Server

### HERMIT_DEFAULT_LIST_SIZE

Default list size when query a list without `first` or `last`

- type: string
- default: 10

### HERMIT_MAX_COMPLEXITY

A large query would be banned when complexity over this value. Each field corresponds to one unit of complexity, that means the complexity of a list is _n(rows)_ \* _m(columns)_

- type: number
- default: 500

### HERMIT_MAX_SKIP_SIZE

Protect against excessive page-turning, which can lead to performance issues

- type: number
- default: 10000

### HERMIT_CACHE_URL

The Redis connection URI

- type: string
- default: (empty)
