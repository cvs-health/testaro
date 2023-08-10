import 'polyfills';
import { App } from './app';
import { Config } from './config';
import { $runnerSettings } from './constants/aslint';
import { Global } from './utils/global';
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Array<T> {
    flat(depth: number): Array<T>;
    flatMap(f: Function): Array<T>;
  }
}

const configInstance: Config = Config.getInstance();

Global.context[configInstance.get($runnerSettings.namespace)] = new App();
