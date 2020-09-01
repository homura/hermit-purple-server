import { Counter, Gauge, Metric, Registry } from 'prom-client';

export const hermitRegistry = new Registry();

export function registerMetric<T extends Metric<string>>(metric: T): T {
  hermitRegistry.registerMetric(metric);
  return metric;
}

export const g_muta_sync_fetched = registerMetric(
  new Gauge({
    name: 'muta_sync_fetch_count',
    help: 'fetched resource count',
    labelNames: ['type'],
  }),
);

export const g_muta_sync_remote_height = registerMetric(
  new Gauge({
    name: 'muta_sync_remote_height',
    help: 'current synced remote height',
    labelNames: ['height_type'],
  }),
);

export const g_muta_sync_local_height = registerMetric(
  new Gauge({
    name: 'muta_sync_local_height',
    help: 'current synced local height',
    labelNames: ['height_type'],
  }),
);

export const c_muta_sync_fetch_second = registerMetric(
  new Counter({
    name: 'muta_sync_fetch_second',
    help: 'fetch time usage',
  }),
);

export const c_muta_sync_save_second = registerMetric(
  new Counter({
    name: 'muta_sync_save_second',
    help: 'sync time usage',
    labelNames: ['type'],
  }),
);

