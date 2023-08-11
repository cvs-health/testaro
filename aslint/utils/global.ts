/* eslint-disable */
export class Global {

  public static get context(): any {
    return (function (): any {
      if (typeof globalThis === 'object') {
        return globalThis;
      }

      Object.defineProperty(Object.prototype, '__magic__', {
        configurable: true,
        get: function () {
          return this;
        }
      });

      /* @ts-ignore */
      __magic__.globalThis = __magic__;

      /* @ts-ignore */
      delete Object.prototype.__magic__;
    }());
  }

}
