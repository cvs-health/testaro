import { Global } from './global';
import { ObjectUtility } from './object';

describe('Utils', () => {
  describe('ObjectUtility', () => {

    it('should indicate that class exists', () => {
      const objectUtility = new ObjectUtility();

      expect(objectUtility).toBeDefined();
    });

    describe('#extend', () => {

      it('should extend object A with B', () => {
        const a = {
          a: 1
        };

        const b = {
          b: 1,
          c: {
            c: 1
          }
        };

        ObjectUtility.extend(a, b);

        // @ts-ignore
        expect(a.b).toBe(1);
        // @ts-ignore
        expect(a.c.c).toBe(1);
      });

      it('should extend new object with specified object (deep copy)', () => {
        const sourceObject = {
          arr: [
            {
              example: 'example'
            }
          ],
          date: new Date('2017-05-07'),
          id: 1,
          nodes: [
            document.createElement('span')
          ],
          regexp: new RegExp(/test/),
          str: 'str'
        };

        Object.defineProperty(sourceObject, 'notEnumerable', {
          enumerable: false,
          value: 'notEnumerable'
        });

        const extendedObject = ObjectUtility.extend({}, sourceObject);

        extendedObject.id = 2;
        extendedObject.arr[0].example = 'example2';
        extendedObject.nodes[0] = document.createElement('div');
        extendedObject.str = 'str2';
        extendedObject.regexp = 'regexp';
        extendedObject.date = 'date';

        expect(sourceObject.id).toBe(1);
        expect(sourceObject.arr[0].example).toBe('example');
        expect(sourceObject.nodes[0].nodeName.toLowerCase()).toBe('span');
        expect(sourceObject.str).toBe('str');
        expect(Object.prototype.toString.call(sourceObject.regexp)).toBe('[object RegExp]');
        expect(Object.prototype.toString.call(sourceObject.date)).toBe('[object Date]');
        // @ts-ignore
        expect(sourceObject.notEnumerable).toBe('notEnumerable');
        expect(extendedObject.notEnumerable).toBeUndefined();
      });

    });

    describe('#isHostObjectProperty', () => {

      it('should test if the specified host object property references an object that is safe to evaluate', () => {
        const o = {
          method: () => {
          }
        };

        const x = {
          a: 1
        };

        expect(ObjectUtility.isHostObjectProperty(o, 'method')).toBeTruthy();
        expect(ObjectUtility.isHostObjectProperty(x, 'a')).toBeFalsy();
      });

    });

    describe('#isTypeOf', () => {

      it('should return false if no arguments passed', () => {
        expect(() => {
          // @ts-ignore
          ObjectUtility.isTypeOf();
        }).toThrowError('[ObjectUtility.isTypeOf] requires two arguments');
      });

      it('should return true when object type undefined passed', () => {
        const a = undefined;

        expect(ObjectUtility.isTypeOf(a, 'undefined')).toBeTruthy();
      });

      it('should return true when object type function passed', () => {
        expect(ObjectUtility.isTypeOf(() => {
        }, 'function')).toBeTruthy();
      });

      it('should return true when object type number passed and it\'s type is passed in capital letters', () => {
        expect(ObjectUtility.isTypeOf(1, 'NUMBER')).toBeTruthy();
      });

      it('should return true when object type nubmer passed', () => {
        expect(ObjectUtility.isTypeOf(1, 'number')).toBeTruthy();
      });

      it('should return true object type null passed', () => {
        expect(ObjectUtility.isTypeOf(null, 'null')).toBeTruthy();
      });

      it('should return true object type null passed', () => {
        expect(ObjectUtility.isTypeOf(null, 'object')).toBeFalsy();
      });

      it('should return true when object type object passed', () => {
        expect(ObjectUtility.isTypeOf({}, 'object')).toBeTruthy();
      });

      it('should return false when object type object passed, but check type is for string', () => {
        expect(ObjectUtility.isTypeOf({}, 'string')).toBeFalsy();
      });

      it('should return true when object type array passed', () => {
        expect(ObjectUtility.isTypeOf([], 'array')).toBeTruthy();
      });

      it('should return false when passed array, but checked for "object"', () => {
        expect(ObjectUtility.isTypeOf([], 'object')).toBeFalsy();
      });

      it('should return true when object type string passed', () => {
        expect(ObjectUtility.isTypeOf('test', 'string')).toBeTruthy();
        expect(ObjectUtility.isTypeOf('', 'string')).toBeTruthy();
      });

      it('should return true when object type boolean passed', () => {
        expect(ObjectUtility.isTypeOf(true, 'boolean')).toBeTruthy();
        expect(ObjectUtility.isTypeOf(false, 'boolean')).toBeTruthy();
      });

      // ES6 feature (need this verification especially for PhantomJS)
      if (ObjectUtility.isHostMethod(Global, 'Symbol')) {

        it('should return true when object type symbol passed', () => {
          expect(ObjectUtility.isTypeOf(Global.context.Symbol('foo'), 'symbol')).toBeTruthy();
        });

      }

    });

    describe('#getTypeOf', () => {

      it('should return false if no arguments passed', () => {
        expect(ObjectUtility.getTypeOf()).toBe('unknown');
      });

      it('should return "undefined" when object type undefined passed', () => {
        const a = undefined;

        expect(ObjectUtility.getTypeOf(a)).toBe('undefined');
      });

      it('should return "boolean" when object type boolean (false) passed', () => {
        const a: boolean = false;

        expect(ObjectUtility.getTypeOf(a)).toBe('boolean');
      });

      it('should return "boolean" when object type boolean (true) passed', () => {
        const a: boolean = true;

        expect(ObjectUtility.getTypeOf(a)).toBe('boolean');
      });

      it('should return "number" when object type number passed', () => {
        expect(ObjectUtility.getTypeOf(1)).toBe('number');
      });

      it('should return "string" when object type string passed', () => {
        expect(ObjectUtility.getTypeOf('test')).toBe('string');
      });

      it('should return "object" when object type object passed', () => {
        expect(ObjectUtility.getTypeOf({})).toBe('object');
      });

      it('should return "null" when object type null passed', () => {
        expect(ObjectUtility.getTypeOf(null)).toBe('null');
      });

      it('should return "array" when object type array passed', () => {
        expect(ObjectUtility.getTypeOf([])).toBe('array');
      });

      it('should return "htmldivelement" when object type HTMLElement passed', () => {
        expect(ObjectUtility.getTypeOf(document.createElement('div'))).toBe('htmldivelement');
      });

      // ES6 feature (need this verification especially for PhantomJS)
      if (ObjectUtility.isHostMethod(Global, 'Symbol')) {

        it('should return "symbol" when object type symbol passed', () => {
          expect(ObjectUtility.getTypeOf(Global.context.Symbol('foo'))).toBe('symbol');
        });

      }

    });

    describe('#isNumber', () => {

      it('should return true if object is a number type', () => {
        expect(ObjectUtility.isNumber(-1)).toBeTruthy();
        expect(ObjectUtility.isNumber(-1.1)).toBeTruthy();
        expect(ObjectUtility.isNumber(-0.1)).toBeTruthy();
        expect(ObjectUtility.isNumber(-0.1)).toBeTruthy();

        expect(ObjectUtility.isNumber(1)).toBeTruthy();
        expect(ObjectUtility.isNumber(1.1)).toBeTruthy();
        expect(ObjectUtility.isNumber(0.1)).toBeTruthy();
        expect(ObjectUtility.isNumber(0.1)).toBeTruthy();
        expect(ObjectUtility.isNumber(0)).toBeTruthy();

        expect(ObjectUtility.isNumber('0x1')).toBeTruthy();
      });

      it('should return true if numbers are passed as a string type', () => {
        expect(ObjectUtility.isNumber('-1')).toBeTruthy();
        expect(ObjectUtility.isNumber('-1.1')).toBeTruthy();
        expect(ObjectUtility.isNumber('-0.1')).toBeTruthy();
        expect(ObjectUtility.isNumber('-.1')).toBeTruthy();

        expect(ObjectUtility.isNumber('1')).toBeTruthy();
        expect(ObjectUtility.isNumber('1.1')).toBeTruthy();
        expect(ObjectUtility.isNumber('0.1')).toBeTruthy();
        expect(ObjectUtility.isNumber('.1')).toBeTruthy();
        expect(ObjectUtility.isNumber('0.00')).toBeTruthy();
      });

      it('should return false if object is not a number type', () => {
        expect(ObjectUtility.isNumber({})).toBeFalsy();
        expect(ObjectUtility.isNumber([])).toBeFalsy();
        expect(ObjectUtility.isNumber('')).toBeFalsy();
        expect(ObjectUtility.isNumber('foo')).toBeFalsy();
        expect(ObjectUtility.isNumber(false)).toBeFalsy();
        expect(ObjectUtility.isNumber(true)).toBeFalsy();
      });

    });

    // Enable after moving the isHtmlElement method from shared folder
    describe('#isHtmlElement', () => {

      it('should determine that tested element is HTML element', () => {
        let el: Node | Element = document.createElement('div');

        expect(ObjectUtility.isHtmlElement(el)).toBeTruthy();

        el = document.createElement('circle');
        expect(ObjectUtility.isHtmlElement(el)).toBeTruthy();

        el = document.createElement('svg');
        expect(ObjectUtility.isHtmlElement(el)).toBeTruthy();

        el = document.createElement('body');
        expect(ObjectUtility.isHtmlElement(el)).toBeTruthy();
      });

      it('should return false if passed text node type', () => {
        const el = document.createTextNode('test');

        expect(ObjectUtility.isHtmlElement(el)).toBeFalsy();
      });

      it('should return false if passed node not element type', () => {
        const div = document.createTextNode('test');

        expect(ObjectUtility.isHtmlElement(div)).toBeFalsy();
      });

      it('should return false when passed no argument', () => {
        // @ts-ignore
        expect(ObjectUtility.isHtmlElement()).toBeFalsy();
      });

      it('should return false when passed null as an argument', () => {
        expect(ObjectUtility.isHtmlElement(null)).toBeFalsy();
      });

      it('should return false when passed Array as an argument', () => {
        // @ts-ignore
        expect(ObjectUtility.isHtmlElement([])).toBeFalsy();
      });

      it('should return false when passed Object with no properties as an argument', () => {
        // @ts-ignore
        expect(ObjectUtility.isHtmlElement([])).toBeFalsy();
      });

    });

    describe('#deleteProperties', () => {

      it('should remove all properties from object, except those that are in prototype chain', () => {
        const o = Object.create(
          {
            a: 1
          },
          {
            b: {
              configurable: true,
              enumerable: true,
              value: 1,
              writable: true
            }
          }
        );

        expect(Object.keys(ObjectUtility.deleteProperties(o)).length).toBe(0);
        expect(Object.getPrototypeOf(o).a).toBe(1);
      });

    });

    describe('#clearArray', () => {

      it('should remove all items from array and keep the same array object', () => {

        // @ts-ignore
        const arr: [] = [1, 2, 3],
          clearedArray = ObjectUtility.clearArray(arr);

        expect(clearedArray.length).toBe(0);
        expect(clearedArray === arr).toBeTruthy();
      });

    });

    describe('#isNativeMethod', () => {

      it('should determine that tested method is a native, built-in method', () => {
        expect(ObjectUtility.isNativeMethod(String.prototype.trim)).toBeTruthy();
      });

      it('should determine that tested method is not a native, built-in method', () => {
        const s: string = 'test';

        expect(ObjectUtility.isNativeMethod(s)).toBeFalsy();
      });

    });

    describe('#getProperty', () => {

      it('should return null if value for the object with specified property does not exists', () => {
        const o = {};

        expect(ObjectUtility.getProperty(o, 'just.another.property')).toBeUndefined();
      });

      it('should return value if specified object property does exists', () => {
        const o = {
          test: {
            hello: '1'
          }
        };

        expect(ObjectUtility.getProperty(o, 'test.hello')).toEqual('1');
      });

    });

    describe('#setProperty', () => {

      it('should set value for the object with specified property defined as a string with dots', () => {
        const o = {};

        ObjectUtility.setProperty(o, 'just.another.property', true);

        expect(o).toEqual(expect.objectContaining({
          just: {
            another: {
              property: true
            }
          }
        }));
      });

      it('should return null if passed object is not type object or array', () => {
        expect(ObjectUtility.setProperty(false, 'just.another.property', true)).toBe(null);
        expect(ObjectUtility.setProperty('', 'just.another.property', true)).toBe(null);
        expect(ObjectUtility.setProperty(1, 'just.another.property', true)).toBe(null);
      });

      it('should return null if passed key as a non-string type', () => {
        // @ts-ignore
        expect(ObjectUtility.setProperty({})).toBe(null);
      });

    });

    describe('#clone', () => {

      it('should clone array without mutations on original array', () => {
        const arr = [1],
          cloned = arr.slice(0);

        expect(cloned[0]).toBe(1);

        cloned[0] = 2;

        expect(cloned[0]).toBe(2);
        expect(arr[0]).toBe(1);
      });

      it('should return cloned object without mutation original object #1', () => {
        const o = {
          a: 1,
          b: {
            z: 'b'
          },
          c: 'test',
          d: [1],
          e: true,
          f: new Date('2017-05-07'),
          g: new RegExp(/test/),
          h: [
            document.createElement('div')
          ]
        };
        const oldDate: number = o.f.getDate();
        const cloned = ObjectUtility.clone(o);

        cloned.a = 2;
        cloned.b.z = 2;
        cloned.c = 'test2';
        cloned.d[0] = 2;
        cloned.e = false;
        cloned.f.setDate('6');
        cloned.g = 'removed RegExp';

        expect(o.a).toBe(1);
        expect(o.b.z).toBe('b');
        expect(o.c).toBe('test');
        expect(o.d[0]).toBe(1);
        expect(o.e).toBe(true);
        expect(o.f.getDate()).toBe(oldDate);
        expect(Object.prototype.toString.call(o.g)).toBe('[object RegExp]');
        /*
         * TODO: find out why it returns [object Object]
         * expect(Object.prototype.toString.call(cloned.h[0])).toBe('[object HTMLDivElement]');
         */
      });

      it('should return cloned object without mutation original object #2', () => {
        const o = {
          id: 1,
          impact: 'major',
          links: [
            {
              content: 'content',
              url: 'url'
            }
          ],
          message: 'message',
          nodes: [
            document.createElement('span')
          ],
          ruleId: 'ruleId',
          title: 'title',
          type: 'type'
        };

        const cloned = ObjectUtility.clone(o);

        expect(Object.prototype.toString.call(cloned.links).slice(8, -1)
          .toLowerCase()).toBe('array');

        expect(Object.prototype.toString.call(cloned.nodes).slice(8, -1)
          .toLowerCase()).toBe('array');

        cloned.id = 2;
        cloned.impact = 'minor';
        cloned.links[0].content = 'content2';
        cloned.links[0].url = 'url2';
        cloned.message = 'message2';
        cloned.nodes[0] = document.createElement('div');
        cloned.ruleId = 'ruleId2';
        cloned.title = 'title2';
        cloned.type = 'type2';

        expect(o.id).toBe(1);
        expect(o.impact).toBe('major');
        expect(o.links[0].content).toBe('content');
        expect(o.links[0].url).toBe('url');
        expect(o.message).toBe('message');
        expect(o.nodes[0].nodeName.toLowerCase()).toBe('span');
        expect(o.ruleId).toBe('ruleId');
        expect(o.title).toBe('title');
        expect(o.type).toBe('type');
      });

    });

  });
});
