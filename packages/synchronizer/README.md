# @muta-extra/synchronizer

Providing the default synchronizer for Muta instance.

## Environment Variables

### HERMIT_FETCH_CONCURRENCY

Maximum number of concurrent **requests**

- type: number
- default: 20

### HERMIT_MAX_PREFETCH_SIZE

Maximum number of concurrent requests for **blocks**

- type: number
- default: 5

## Programming Usage

```ts
import {
  ISynchronizerAdapter,
  PollingSynchronizer,
} from '@muta-extra/synchronizer';

export function sync() {
  const myAdapter: ISynchronizerAdapter = {
    // ...
  };
  return new PollingSynchronizer(myAdapter).run();
}

sync();
```
