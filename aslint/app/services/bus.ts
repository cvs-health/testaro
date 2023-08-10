import { busEvent } from '../constants/events';
import { ObjectUtility } from '../utils/object';

export enum BusListenersPool {
  internal = 'internal',
  external = 'external'
}

type TListeners = { [pool in keyof typeof BusListenersPool]: { [key: string]: Function[] } };

export class Bus {
  private static listeners: TListeners = Bus.removeAllListeners();

  constructor() { }

  private static removeAllListeners(): TListeners {
    return {
      [BusListenersPool.internal]: {},
      [BusListenersPool.external]: {}
    };
  }

  public static subscribe(eventName: string, listener: Function, pool: BusListenersPool = BusListenersPool.internal): void {
    if (ObjectUtility.isTypeOf(listener, 'function') === false) {
      console.warn('[Bus.subscribe] trying to subscribe invalid type of listener: ', ObjectUtility.getTypeOf(listener));

      return;
    }

    if (typeof Bus.listeners[pool][eventName] === 'undefined') {
      Bus.listeners[pool][eventName] = [];
    }

    Bus.listeners[pool][eventName].push(listener);
  }

  public static subscribeOnce(eventName: string, listener: Function): any {
    const handler = (...args: any): any => {
      listener.apply(this, args);
      Bus.unsubscribe(eventName, handler);
    };

    Bus.subscribe(eventName, handler);
  }

  public static unsubscribe(eventName: string, listener?: Function, pool: BusListenersPool = BusListenersPool.internal): void {
    if (typeof eventName === 'undefined') {
      throw new Error('[Bus.unsubscribe] missing event name');
    }

    const lastIndex: number = Bus.listeners[pool][eventName] ? Bus.listeners[pool][eventName].length : 0;

    if (listener instanceof Function) {
      for (let i: number = lastIndex - 1; i >= 0; i -= 1) {
        if (Bus.listeners[pool][eventName][i] === listener) {
          Bus.listeners[pool][eventName].splice(i, 1);
        }
      }
    } else {
      delete Bus.listeners[pool][eventName];
    }
  }

  public static unsubscribeAll(): void {
    Bus.listeners = Bus.removeAllListeners();
  }

  public static publish(eventName: string, ...args: any[]): void {
    let lastIndex: number;

    if (Object.keys(busEvent).includes(eventName) === false) {
      throw new Error(`[Bus.publish] Trying to publish non exists event: ${eventName}`);
    }

    const triggerEventListenerCallback = (pool: string): void => {
      const eventListener: { [key: string]: Function[] } = Bus.listeners[pool as keyof typeof Bus.listeners];

      lastIndex = eventListener[eventName] ? eventListener[eventName].length : 0;

      for (let i: number = lastIndex - 1; i >= 0; i -= 1) {
        if (eventListener[eventName]) {
          eventListener[eventName][i].apply(this, args);
        }
      }
    };

    [BusListenersPool.internal, BusListenersPool.external].forEach(triggerEventListenerCallback);
  }

}
