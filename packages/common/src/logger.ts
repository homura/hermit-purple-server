import { debug as createDebugger, Debugger } from 'debug';

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

interface DebuggerOptions {
  namespace: string;
  level?: LogLevel;
  module?: string;
}

function createDebuggerWithNamespace(options: DebuggerOptions): Debugger {
  const { namespace, level = 'info', module = '' } = options || {};
  return createDebugger(`${namespace}:${level}${module ? ':' + module : ''}`);
}

export class Logger {
  trace: Debugger;
  debug: Debugger;
  info: Debugger;
  warn: Debugger;
  error: Debugger;

  constructor(private namespace = 'muta-extra', private module?: string) {
    function createDebugger(level: LogLevel): Debugger {
      return createDebuggerWithNamespace({ namespace, module, level });
    }

    this.trace = createDebugger('trace');
    this.debug = createDebugger('debug');
    this.info = createDebugger('info');
    this.warn = createDebugger('warn');
    this.error = createDebugger('error');
  }
}

export const logger = new Logger();
