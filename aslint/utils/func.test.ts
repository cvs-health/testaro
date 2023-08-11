import { Global } from './global';
import { Func } from './func';

describe('Func', () => {

  describe('#extend', () => {
    let objectToExtend: { defaultProperty?: any; defaultMethod?: any; o?: any },
      objectExtendDefault: { defaultProperty: number; defaultMethod: () => any },
      objectExtendDeep: { defaultProperty: number; defaultMethod: () => any; o: { arr: any[] } };

    beforeEach(() => {
      objectToExtend = {};

      objectExtendDefault = {
        defaultMethod: () => {
          return null;
        },
        defaultProperty: 1
      };

      objectExtendDeep = {
        defaultMethod: () => {
          return null;
        },
        defaultProperty: 1,
        o: {
          arr: []
        }
      };
    });

    it('extend empty object with default values', () => {
      Func.mixin(objectToExtend, objectExtendDefault);
      expect(objectToExtend.defaultProperty).toBe(1);
      expect(typeof objectToExtend.defaultMethod).toBe('function');
    });

    it('extend filled object with default values, overwrite values', () => {
      objectToExtend.defaultProperty = 2;
      Func.mixin(objectToExtend, objectExtendDefault);
      expect(objectToExtend.defaultProperty).toBe(1);
      expect(typeof objectToExtend.defaultMethod).toBe('function');
    });

    it('deep extend filled object with default values, overwrite values', () => {
      Func.mixin(objectToExtend, objectExtendDeep);
      expect(objectToExtend.defaultProperty).toBe(1);
      expect(typeof objectToExtend.defaultMethod).toBe('function');
      expect(typeof objectToExtend.o).toBe('object');
    });

  });

  describe('#defaults', () => {

    let target: { str: any; num: any; bool: any; arr: any; obj: any; und: any; nul: any; a?: any; zero?: any };

    beforeEach(() => {
      target = {
        arr: [1, 2, 3],
        bool: true,
        nul: null,
        num: 42,
        obj: {
          bar: 'bar',
          foo: 'foo'
        },
        str: 'str',
        und: undefined
      };
    });

    afterEach(() => {
      target = undefined;
    });

    it('add properties to the target object if the property is not previously defined', () => {
      Func.defaults(target, {
        a: 'a',
        und: 'defined',
        zero: 0
      });

      expect(target.str).toBe('str');
      expect(target.num).toBe(42);
      expect(target.bool).toBe(true);
      expect(target.arr).toEqual([1, 2, 3]);
      expect(target.obj).toEqual({
        bar: 'bar',
        foo: 'foo'
      });
      expect(target.und).toBe('defined');
      expect(target.nul).toBe(null);
      expect(target.a).toBe('a');
      expect(target.zero).toBe(0);
    });

    it('does not add a property to the target object if it is already defined', () => {
      Func.defaults(target, {
        nul: 'null',
        str: 'newstr',
        und: 'defined'
      });
      expect(target.str).toBe('str');
      expect(target.nul).toBe(null);
    });

    it('returns a new object with all merged defaults if target is null or undefined', () => {
      const defaulted = Func.defaults(null, {
        a: 'a',
        zero: 0
      });

      expect(defaulted).toEqual({
        a: 'a',
        zero: 0
      });
      expect(defaulted).not.toBe({
        a: 'a',
        zero: 0
      });
    });
  });

  describe('#namespace', () => {
    const ns = 'Test.Foo.Bar.Baz';

    beforeEach(() => {
      expect(Global.context.Test).toBeUndefined();
    });

    afterEach(() => {
      delete Global.context.Test;
    });

    it('returns the global object if it exists for the given namespace', () => {
      Global.context.Test = {
        Already: 'here'
      };

      const baz = Func.namespace(ns);

      expect(Global.context.Test).toBeDefined();
      expect(Global.context.Test.Already).toBe('here');
      expect(Global.context.Test.Foo.Bar).toBeDefined();
      expect(Global.context.Test.Foo.Bar.Baz).toBeDefined();
      expect(Global.context.Test.Foo.Bar.Baz).toBe(baz);
    });

    it('returns a new object if no global object exists for the given namespace', () => {
      const baz = Func.namespace(ns);

      expect(Global.context.Test.Foo).toBeDefined();
      expect(Global.context.Test.Foo.Bar).toBeDefined();
      expect(Global.context.Test.Foo.Bar.Baz).toBeDefined();
      expect(Global.context.Test.Foo.Bar.Baz).toBe(baz);
    });
  });

});
