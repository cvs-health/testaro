export class Async {
  private static DEFAULT_TIMEOUT: number = 10;
  private static DEFAULT_INTERVAL: number = 10;

  constructor() { }

  public static run(fn: any, context?: any, timeout?: number): number {
    const callBack: any = context ? fn.bind(context) : fn;

    return window.setTimeout(callBack, timeout || Async.DEFAULT_TIMEOUT);
  }

  public static interval(fn: any, context: any, intervalId: number): number {
    const callBack: any = context ? fn.bind(context) : fn;

    return window.setInterval(callBack, intervalId || Async.DEFAULT_INTERVAL);
  }

  public static stopInterval(id: number): void {
    window.clearInterval(id);
  }
}
