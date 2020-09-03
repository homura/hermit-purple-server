import { Express } from 'express';
import { hermitRegistry } from './metrics';

interface APMOptions {
  path?: string;
}

/**
 * apply express middleware to export apm metrics
 *
 * @example
 * const express = require('express')
 * const { applyAPMMiddleware } = require('@muta-extra/apm')
 *
 * const app = express()
 * applyAPMMiddleware(app, { path: '/metric' });
 *
 * // http://localhost:3000/metrics would export prometheus metrics
 * app.listen(3000);
 */
export function applyAPMMiddleware(app: Express, options?: APMOptions) {
  const path = options?.path ?? '/metrics';

  app.get(path, async (req, res) => {
    res.set('Content-Type', hermitRegistry.contentType);
    res.end(await hermitRegistry.metrics());
  });
}
