export class Func {

  /**
   * Deep object mixin, extending destination object with properties of source object
   * @method
   * @param {Object} destination object with original values/ new object
   * @param {Object} source object with default values
   * @return {Object} extended object
   */
  public static mixin(targetObject: any, ...sources: any[]): any {
    const target: any = targetObject ? targetObject : {};

    const processSources = (src: any): any => {
      if (src) {
        const copyValue = (key: string): any => {
          target[key] = src[key];
        };

        Object.keys(src).forEach(copyValue);
      }
    };

    sources.forEach(processSources);

    return target;
  }

  /**
   * similar to mixin, but only adds to the target the properties which are undefined
   * @param {object} targetObject - the object to extend
   * @param {...object} sources - an object(s) with properties to be added to the target if the property doesn't exist on the target or on a previous source
   * @returns {object} modified target with added defaults
   */
  public static defaults(targetObject: any, sources: any): any {
    let target: any = {};

    if (targetObject) {
      target = targetObject;
    }

    if (sources) {
      const processSrc = (key: string): void => {
        if (typeof target[key] === 'undefined') {
          target[key] = sources[key];
        }
      };

      Object.keys(sources).forEach(processSrc);
    }

    return target;
  }

  public static namespace(namespace: any, context?: any): any {
    const parts: string[] = namespace.split('.');
    const len: number = parts.length;
    let parent: any = context || global;

    for (let i = 0; i < len; i += 1) {
      if (parent[parts[i]] === undefined) {
        parent[parts[i]] = {};
      }

      parent = parent[parts[i]];
    }

    return parent;
  }

}
