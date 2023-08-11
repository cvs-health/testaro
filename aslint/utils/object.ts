import { Func } from './func';
export class ObjectUtility {
  private static reMethod: RegExp = /^(function|object)$/;
  private static reUnknown: RegExp = /^unknown$/;

  public static getTypeOf(obj?: any): string {
    const defaultType = 'unknown';

    if (arguments.length !== 1) {
      return defaultType;
    }

    return Object.prototype.toString.call(obj).slice(8, -1)
      .toLowerCase();
  }

  /*
   * @method
   * @param {String} type Type of object which you want to check
   * @param {Object} obj Object to test
   * @return {Boolean} Returns true if object type matched to required type
   */

  public static isTypeOf(obj: any, typeToCheck: string): boolean {
    if (arguments.length < 2) {
      throw new TypeError('[ObjectUtility.isTypeOf] requires two arguments');
    }

    const type: string = typeToCheck.toLowerCase();

    return this.getTypeOf(obj) === type;
  }

  public static isNumber(value: any): boolean {
    if (ObjectUtility.getTypeOf(value) === 'number') {
      return Number.isFinite(value);
    }

    if (ObjectUtility.getTypeOf(value) === 'string') {
      return value.trim().length > 0 && Number.isFinite(Number(value));
    }

    return false;
  }

  public static isHtmlElement(el: HTMLElement | Element | Node | null): boolean {
    if (el === null) {
      return false;
    }

    try {
      return el instanceof Element || el instanceof HTMLDocument;
    } catch (t) {
      return (
        typeof el === 'object' &&
        el.nodeType === Node.ELEMENT_NODE &&
        typeof (el as any).style === 'object' &&
        typeof el.ownerDocument === 'object'
      );
    }
  }

  public static isHostMethod(obj: any, method: string): boolean {
    if (!obj) {
      return false;
    }

    const t: string = typeof obj[method];

    return this.reUnknown.test(t) || (this.reMethod.test(t) && Boolean(obj)) || false;
  }

  public static isHostObjectProperty(o: any, p: string): boolean {
    const t: string = typeof o[p];

    return Boolean(this.reMethod.test(t) && o[p]);
  }

  public static isRealObjectProperty(o: any, p: string): boolean {
    return Boolean(typeof o[p] === 'object' && o[p]);
  }

  public static deepMerge(source: any, target: any): any {
    const mergeKeyValue = (key: string): void => {
      if (source[key] instanceof Object && target[key] instanceof Object) {
        if (Array.isArray(source[key]) && Array.isArray(target[key])) {
          source[key] = Array.from(new Set(source[key].concat(target[key])));
        } else if (Array.isArray(source[key]) === false && Array.isArray(target[key]) === false) {
          this.deepMerge(source[key], target[key]);
        } else {
          source[key] = target[key];
        }
      } else {
        source[key] = target[key];
      }
    };

    Object.keys(target).forEach(mergeKeyValue);

    return source;
  }

  public static extend(destination: any, source: any): any {
    let property: any;
    let src: any;

    const cloneArray = (a: any): any => {
      return Object.assign({}, a);
    };

    for (property in source) {
      if (Object.prototype.hasOwnProperty.call(source, property)) {
        src = source[property];

        if (this.isTypeOf(src, 'object')) {
          destination[property] = destination[property] || {};
          this.extend(destination[property], src);
        } else if (Array.isArray(src)) {
          destination[property] = src.map(cloneArray);
        } else if (this.getTypeOf(src) === 'date') {
          destination[property] = new Date(src.valueOf());
        } else if (this.getTypeOf(src) === 'regexp') {
          destination[property] = new RegExp(src);
        } else {
          destination[property] = source[property];
        }
      }
    }

    return destination;
  }

  /*
   * Other objects can be added as well
   * Other clones: https://github.com/pvorb/clone/blob/master/clone.js, https://github.com/angular/angular.js/blob/master/src/Angular.js#L453
   */
  public static clone(o: any): any {
    const gdcc: string = '__getDeepCircularCopy__';

    let result: any;

    if (o !== Object(o)) {
      return o;
    }

    const set: boolean = gdcc in o;
    const cache: any = o[gdcc];

    if (set && typeof cache === 'function') {
      return cache();
    }
    // else
    o[gdcc] = function (): any {
      return result;
    }; // overwrite

    if (Object.getPrototypeOf(o) === null) {
      console.log(o);
    }

    if (Array.isArray(o)) {
      const cloneArray: any = (a: any): any => {
        if (typeof a === 'object') {
          if (a === null) {
            return a;
          }

          return Object.assign({}, a);
        }

        return a;
      };

      result = o.map(cloneArray);
    } else if (Object.getPrototypeOf(o).constructor.name.toLowerCase() === 'date') {
      return new Date(o.valueOf());
    } else if (Object.getPrototypeOf(o).constructor.name.toLowerCase() === 'regexp') {
      return new RegExp(o);
    } else {
      result = {};
      for (const prop in o) {
        if (prop !== gdcc) {
          result[prop] = ObjectUtility.clone(o[prop]);
        } else if (set) {
          result[prop] = ObjectUtility.clone(cache);
        }
      }
    }

    if (set) {
      o[gdcc] = cache; // reset
    } else {
      delete o[gdcc]; // unset again
    }

    return result;
  }

  public static deleteProperties(obj: any): any {
    let prop: any;

    for (prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        delete obj[prop];
      }
    }

    return obj;
  }

  public static clearArray(arr: []): [] {
    arr.length = 0;

    return arr;
  }

  public static isNativeMethod(m: any): boolean {
    const re: RegExp = new RegExp('^(function|object)$', 'i');
    const t: string = typeof m;
    let s: string;

    if (re.test(t)) {
      // Returns a string representing the object and check for [native code] string
      s = String(m);

      return s.indexOf('[native code]') !== -1;
    }

    return false;
  }

  public static getProperty(objectItem: any, keyPath: string): any {
    const properties: string[] = keyPath.split('.');
    const len: number = properties.length;
    let obj: any = objectItem;

    for (let i: number = 0; i < len; i += 1) {
      if (!obj || !obj.hasOwnProperty(properties[i])) {
        return undefined;
      }
      obj = obj[properties[i]];
    }

    return obj;
  }

  public static setProperty(o: any, pathValue: string, value: any): any {
    let obj: any = o;

    if (
      this.isTypeOf(o, 'object') === false ||
      (this.isTypeOf(o, 'array') === false && this.isTypeOf(pathValue, 'string') === false)
    ) {
      return null;
    }

    const path: string[] = pathValue.split('.');
    const last: string | undefined = path.pop();

    if (this.getProperty(o, pathValue) === undefined) {
      Func.namespace(pathValue, o);
    }

    while (path.length && obj) {
      obj = obj[(path.shift()) as keyof typeof obj];
    }

    if (typeof last === 'undefined') {
      // eslint-disable-next-line consistent-return
      return;
    }

    obj[last] = value;

    return obj[last];
  }

}
