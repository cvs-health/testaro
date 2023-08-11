import { CommonUtility } from './common';

describe('Common', () => {
  it('should indicate that class exists', () => {
    const sharedCommonUtility = new CommonUtility();

    expect(sharedCommonUtility).toBeDefined();
  });

  describe('#hasKey', (): void => {
    it('should indicate that specified object has defined key', (): void => {
      let obj;

      let result;

      obj = {
        test: {
          example: {
            p: 1
          }
        }
      };

      result = CommonUtility.hasKey(obj, 'test.example.p');

      expect(result).toBe(true);

      obj = {
        'a.b': 1
      };

      result = CommonUtility.hasKey(obj, ['a.b']);

      expect(result).toBe(true);
      expect(obj['a.b']).toBe(1);

      obj = {
        '': 1
      };

      result = CommonUtility.hasKey(obj, ['']);

      expect(result).toBe(true);
      expect(obj['']).toBe(1);
    });

    it('should indicate that specified object has no defined key', (): void => {
      let obj = {};
      let result = CommonUtility.hasKey(obj, 'test.example.p');

      expect(result).toBe(false);

      obj = null;
      result = CommonUtility.hasKey(obj, 'test.example.p');

      expect(result).toBe(false);

      obj = [];
      result = CommonUtility.hasKey(obj, 'test.example.p');

      expect(result).toBe(false);
    });

    it('should indicate that specified object has defined key and the value under that property exists', () => {
      const obj = {
        foo: {
          bar: 'baz'
        }
      };

      const result = CommonUtility.hasKey(obj, 'foo.bar');

      expect(result).toBe(true);
      expect(obj.foo.bar).toBe('baz');
    });
  });

  describe('#setKey', (): void => {
    it('should create a property and set a value to an empty object', () => {
      expect(CommonUtility.setKey({}, 'test.of.properties', null)).toEqual({
        test: {
          of: {
            properties: null
          }
        }
      });
    });

    it('should create a property and set a value to a non-empty object', () => {
      expect(CommonUtility.setKey({
        test: {}
      }, 'test.of.properties', '6')).toEqual({
        test: {
          of: {
            properties: '6'
          }
        }
      });
    });
  });

  describe('#pick', () => {
    it('should pick values from object', () => {
      const result: any = CommonUtility.pick(
        {
          ignoreThat: 'ignore',
          object: {
            shouldIgnoreThis: 'ignored',
            some: 'value'
          },
          rootValue: 'root'
        },
        'rootValue',
        'object.some'
      );

      expect(result).toEqual({
        object: {
          some: 'value'
        },
        rootValue: 'root'
      });
    });
  });

  describe('#pickArray', () => {
    it('should pick values from objects in array', () => {
      const result: any[] = CommonUtility.pickArray(
        [
          {
            ignoreThat: 'ignore',
            object: {
              shouldIgnoreThis: 'ignored',
              some: 'value'
            },
            rootValue: 'root'
          },
          {
            ignore2: 'ignore',
            rootValue: 'root 2'
          }
        ],
        'rootValue',
        'object.some'
      );

      expect(result).toEqual([{
        object: {
          some: 'value'
        },
        rootValue: 'root'
      },
      {
        rootValue: 'root 2'
      }
      ]);
    });
  });

  describe('#arrayToMap', () => {
    it('should convert array of objects to map by property', () => {
      type ValueStringType = { value: string };
      const values: ValueStringType[] = [{
        value: '1'
      },
      {
        value: '2'
      }];
      const result: Map<string, ValueStringType> = CommonUtility.arrayToMap(values, 'value');

      expect(Array.from(result.entries())).toEqual([
        ['1', {
          value: '1'
        }],
        ['2', {
          value: '2'
        }]
      ]);
    });

    it('should convert array of objects to map by method return value', () => {
      type ValueMethodType = { value: () => number };
      const values: ValueMethodType[] = [{
        value: () => {
          return 1;
        }
      },
      {
        value: () => {
          return 2;
        }
      }];
      const result: Map<number, ValueMethodType> = CommonUtility.arrayToMap(values, 'value');

      expect(Array.from(result.entries())).toEqual([
        [1, values[0]],
        [2, values[1]]
      ]);
    });
  });

  describe('#isNativeMethod', () => {

    it('should determine that function method is a native, built-in method', () => {
      expect(CommonUtility.isNativeMethod(String.prototype.trim)).toBeTruthy();
    });

    it('should determine that tested method is not a native, built-in method', () => {
      const s: string = 'test';

      expect(CommonUtility.isNativeMethod(s)).toBeFalsy();
    });

    it('should determine that object method is not a native, built-in method', () => {
      const obj: object = {
        a: 1,
        b: 2
      };

      expect(CommonUtility.isNativeMethod(obj)).toBeFalsy();
    });

  });

  describe('#isEventSupported', () => {
    it('should indicate than "click" event is supported', () => {
      const isClickEventSupported = CommonUtility.isEventSupported('click');

      expect(isClickEventSupported).toBe(true);
    });

    it('should indicate than "foo" event is not supported', () => {
      const isClickEventSupported = CommonUtility.isEventSupported('foo');

      expect(isClickEventSupported).toBe(false);
    });
  });

});
