import { Global } from './global';

export class Console {

  public static init(globalContext?: any): any {
    const globalAny: any = globalContext || Global.context;
    const consoleCountData: any = {};
    const methods: string[] = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'msIsIndependentlyComposed', 'profile', 'profileEnd', 'select', 'time', 'timeEnd', 'trace', 'warn'];
    const config: any = {
      trace: true
    };

    const noop = (): boolean => {
      return false;
    };

    if (typeof globalAny.console === 'undefined') {
      globalAny.console = {};
    }

    globalAny.console.config = config;

    if (typeof globalAny.console.count === 'undefined') {
      globalAny.console.count = function countCalls(...args: any): any {
        const _arguments = Array.from(args);
        const str = String(_arguments[0]);

        if (typeof consoleCountData[str] === 'number') {
          consoleCountData[str] += 1;
        } else {
          consoleCountData[str] = 1;
        }

        _arguments.shift();
        _arguments.unshift(`${str}: ${consoleCountData[str]}`);

        globalAny.console.log(globalAny.console, ..._arguments);

        return consoleCountData;
      };
    }

    if (typeof globalAny.console.countReset === 'undefined') {
      globalAny.console.countReset = function(str: string): any {
        const title: string = String(str);

        consoleCountData[title] = 0;

        return consoleCountData;
      };
    }

    for (let i: number = 0; i < methods.length; i += 1) {
      if (typeof globalAny.console[methods[i]] === 'undefined') {
        globalAny.console[methods[i]] = noop;
      }
    }

    /**
     * Wrap original console method
     * @param {object} consoleMethod - console method
     * @param {string} methodName - console method name
     */

    const wrapper = (methodName: string): void => {
      const originalMethod: any = globalAny.console[methodName];

      const consoleFn = (args: any): void => {
        if (globalAny.console.config[methodName]) {
          originalMethod.apply(globalAny.console, ...args);
        }
      };

      consoleFn.originalMethod = false;

      globalAny.console[methodName] = consoleFn;
    };

    // Wrapping original console methods
    const processConfig = (key: any): void => {
      wrapper(key);
    };

    Object.keys(globalAny.console.config).forEach(processConfig);

    return globalAny.console;
  }

}
