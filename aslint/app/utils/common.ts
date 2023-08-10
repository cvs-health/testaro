import { ObjectUtility } from './object';

type TypeOfKey<Type, Key extends keyof Type> = Type[Key] extends (...args: any[]) => any ? ReturnType<Type[Key]> : Type[Key];

export class CommonUtility {

  public static hasKey(obj: Object, key: string | string[]): boolean {
    const keys: string[] = Array.isArray(key) ? key : key.split('.');
    const len: number = keys.length;
    let o: Object = obj;
    let result: boolean = true;

    if (o === null) {
      result = false;

      return result;
    }

    for (let i: number = 0; i < len; i += 1) {
      if (typeof o !== 'object' || o === null || Object.prototype.hasOwnProperty.call(o, keys[i]) === false) {
        result = false;
        break;
      }

      o = o[keys[i] as keyof typeof o];
    }

    return result;
  }

  public static setKey(obj: Object, path: string, value: any): Object {
    const pList: string[] = path.split('.');
    const key: string | undefined = pList.pop();

    const createPropertyWithValue = (accumulator: Object, currentValue: string): Object => {
      if (typeof accumulator[currentValue as keyof typeof accumulator] === 'undefined') {
        Object.defineProperty(accumulator, currentValue, {
          configurable: true,
          enumerable: true,
          value: {},
          writable: true
        });
      }

      return accumulator[currentValue as keyof typeof accumulator];
    };

    if (typeof key === 'undefined') {
      throw new Error('[Common.setKey] Invalid type of key. Should be stringm provided undefined');
    }

    const pointer: Object = pList.reduce(createPropertyWithValue, obj);

    pointer[key as keyof typeof pointer] = value;

    return obj;
  }

  public static pick<T, K extends keyof T>(value: T, ...props: Array<K | string>): Pick<T, K> | any {
    const result: Pick<T, K> = {} as any;

    for (const prop of props) {
      if (prop as any in value) {
        result[prop as K] = value[prop as K];
      } else {
        const path: string = prop as string;

        if (CommonUtility.hasKey(value, path)) {
          const deepValue: any = path.split('.').reduce((prev: any, current: string) => {
            return prev[current];
          }, value);

          CommonUtility.setKey(result, path, deepValue);
        }
      }
    }

    return result;
  }

  public static pickArray<T, K extends keyof T>(values: T[], ...props: Array<K | string>): Array<Pick<T, K> | any> {
    return values.map((value: T) => {
      return this.pick(value, ...props);
    });
  }

  public static arrayToMap<T, K extends keyof T>(objects: T[], key: K): Map<TypeOfKey<T, K>, T> {
    const getKey = (object: T): TypeOfKey<T, K> => {
      return typeof object[key] === 'function' ? ((object[key] as unknown) as Function).call(object) : object[key];
    };

    return new Map<TypeOfKey<T, K>, T>(objects.map((object: T) => {
      return [getKey(object), object];
    }));
  }

  public static isHtmlDocument(el: any): boolean {
    return Boolean(el) && el.nodeType === Node.DOCUMENT_NODE;
  }

  public static isNativeMethod(methodName: any): boolean {
    const regEx: RegExp = new RegExp('^(function|object)$', 'i');
    const argumentType: string = typeof methodName;
    let str: string;

    if (regEx.test(argumentType)) {
      // Returns a string representing the object and check for [native code] string
      str = String(methodName);

      return str.indexOf('[native code]') !== -1;
    }

    return false;
  }

  public static randomRange(minVal: number = 0, max: number = 1000000): number {
    const min: number = Math.ceil(minVal);

    return Math.floor(Math.random() * (Math.floor(max) - min)) + min;
  }

  public static isEventSupported(event: string, htmlElement?: HTMLElement): boolean {
    const TAGNAMES: { [key: string]: string } = {
      abort: 'img',
      change: 'input',
      error: 'img',
      load: 'img',
      reset: 'form',
      select: 'input',
      submit: 'form'
    };

    let element: HTMLElement = htmlElement || document.createElement(TAGNAMES[event] || 'div');
    const eventName: string = `on${event}`;

    // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
    let isSupported: boolean = eventName in document;

    if (isSupported === false) {
      if (ObjectUtility.isHostMethod(element, 'setAttribute') === false) {
        element = document.createElement('div');
      }

      if (ObjectUtility.isHostMethod(element, 'setAttribute') && ObjectUtility.isHostMethod(element, 'removeAttribute')) {
        element.setAttribute(eventName, '');
        isSupported = typeof element[eventName as keyof HTMLElement] === 'function';

        if (typeof element[eventName as keyof HTMLElement] !== 'undefined') {
          const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(element, eventName);

          if (descriptor?.writable) {
            Object.defineProperty(element, eventName, {
              configurable: true,
              enumerable: true,
              value: undefined,
              writable: true
            });
          }
        }

        element.removeAttribute(eventName);
      }
    }

    return isSupported;
  }

}
