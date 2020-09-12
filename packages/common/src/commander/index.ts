import { Command } from 'commander';
import { dirname } from 'path';
import readPkgUp from 'read-pkg-up';
import { loadEnvFile } from './load-env';

function callerDir(depth: number = 1): string {
  const _ = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack!.slice(depth);
  Error.prepareStackTrace = _;

  const caller = (stack as any).find(
    (c: NodeJS.CallSite) => c.getTypeName() !== null,
  );

  return dirname(caller.getFileName());
}

export function createVersionedCommander(
  cwd: string = callerDir(2),
  name?: string,
): Command {
  loadEnvFile();
  const program = new Command(name);
  program.version(
    readPkgUp.sync({ cwd })?.packageJson.version ?? 'unknown',
    '-v --version',
    'show current version'
  );
  return program as Command;
}

export { loadEnvFile, Command };
