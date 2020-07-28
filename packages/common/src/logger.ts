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
}

export const logger: Logger = (message) => {
  log(message);
};

logger.childLogger = (ns) => {
  ns = ns.startsWith('muta:') ? ns : 'muta:' + ns;
  return createDebugger(ns);
};

export const trace = logger.childLogger('muta:extra:trace');
export const debug = logger.childLogger('muta:extra:debug');
export const info = logger.childLogger('muta:extra:info');
export const warn = logger.childLogger('muta:extra:warn');
export const error = logger.childLogger('muta:extra:error');
