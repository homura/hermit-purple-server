import { debug as createDebugger, Debugger } from 'debug';

const log = createDebugger('muta:extra');

interface Logger {
  /**
   * log the message
   */
  (message: string): void;

  /**
   * create a child logger with new namespace like `muta:some_namespace`
   * @param namespace
   */
  childLogger: (namespace: string) => Debugger;

  trace: Debugger;
  debug: Debugger;
  info: Debugger;
  warn: Debugger;
  error: Debugger;
}

export const logger: Logger = (message) => {
  log(message);
};

logger.childLogger = (ns) => {
  ns =
    ns.startsWith('muta:') || ns.startsWith('muta-extra:')
      ? ns
      : 'muta-extra:' + ns;
  return createDebugger(ns);
};

export const trace = logger.childLogger('trace');
export const debug = logger.childLogger('debug');
export const info = logger.childLogger('info');
export const warn = logger.childLogger('warn');
export const error = logger.childLogger('error');

logger.trace = trace;
logger.debug = debug;
logger.info = info;
logger.warn = warn;
logger.error = error;
