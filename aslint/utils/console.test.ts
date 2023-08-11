import { Console } from './console';
import { Global } from './global';

describe('Utils', () => {

  describe('Console', () => {

    let consoleObject: any, global: any;

    beforeEach(() => {
      global = {
        console: {}
      };
    });

    afterEach(() => {
      consoleObject = undefined;
    });

    it('assigns global object when not provided in argument of console init', () => {
      consoleObject = Console.init();
      expect(consoleObject).toBe(Global.context.console);
    });

    it('checks, if custom method are applied (replaced native method)', () => {
      consoleObject = Console.init(global);

      Object.keys(consoleObject.config).forEach((key) => {
        expect(typeof consoleObject[key]).toBe('function');
        expect(consoleObject[key].toString().indexOf('[native code]')).toBeLessThan(0);
      });
    });

    it('polyfill console.count when it does not exists', () => {

      let consoleCountData: { test: any };

      consoleObject = Console.init({});
      consoleCountData = consoleObject.count('test');

      expect(consoleObject.count).toBeDefined();
      expect(consoleCountData.test).toBe(1);

      consoleCountData = consoleObject.count('test');
      expect(consoleCountData.test).toBe(2);
    });

    it('polyfill console.countReset should be created when it does not exists', () => {
      consoleObject = Console.init({});
      consoleObject.count('test');

      const consoleCountData = consoleObject.countReset('test');

      expect(typeof consoleObject.countReset).toBe('function');
      expect(consoleCountData.test).toBe(0);
    });

    it('assign no-operation function when specified method does not exists in current console object', () => {
      consoleObject = Console.init({});

      expect(typeof consoleObject.assert).toBe('function');
      expect(typeof consoleObject.clear).toBe('function');
      expect(typeof consoleObject.count).toBe('function');
      expect(typeof consoleObject.debug).toBe('function');
      expect(typeof consoleObject.dir).toBe('function');
      expect(typeof consoleObject.dirxml).toBe('function');
      expect(typeof consoleObject.error).toBe('function');
      expect(typeof consoleObject.group).toBe('function');
      expect(typeof consoleObject.groupCollapsed).toBe('function');
      expect(typeof consoleObject.groupEnd).toBe('function');
      expect(typeof consoleObject.info).toBe('function');
      expect(typeof consoleObject.log).toBe('function');
      expect(typeof consoleObject.msIsIndependentlyComposed).toBe('function');
      expect(typeof consoleObject.profile).toBe('function');
      expect(typeof consoleObject.profileEnd).toBe('function');
      expect(typeof consoleObject.select).toBe('function');
      expect(typeof consoleObject.time).toBe('function');
      expect(typeof consoleObject.timeEnd).toBe('function');
      expect(typeof consoleObject.trace).toBe('function');
      expect(typeof consoleObject.warn).toBe('function');
    });

  });

});
