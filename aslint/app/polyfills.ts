import 'whatwg-fetch';

/*
 * https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
 */
if (typeof String.prototype.padStart !== 'function') {
  // eslint-disable-next-line no-extend-native
  String.prototype.padStart = function padStart(targetLength: number, padString: string): string {
    let _targetLength: number = targetLength;
    let _padString: string = padString;

    _targetLength >>= 0;
    _padString = String(typeof _padString !== 'undefined' ? _padString : ' ');

    if (this.length > _targetLength) {
      return String(this);
    }

    _targetLength -= this.length;

    if (_targetLength > _padString.length) {
      _padString += _padString.repeat(_targetLength / _padString.length);
    }

    return _padString.slice(0, _targetLength) + String(this);
  };
}

// matches polyfill
if (typeof Element.prototype.matches === 'undefined') {
  Element.prototype.matches = function matches(selector: string) {

    // eslint-disable-next-line consistent-this
    const element: Node = this;
    const elements: HTMLElement[] = (element.ownerDocument || (element as any).document).querySelectorAll(selector);
    let index: number = 0;

    while (elements[index] && elements[index] !== element) {
      ++index;
    }

    return Boolean(elements[index]);
  };
}

// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest

if (typeof Element.prototype.closest !== 'function') {
  Element.prototype.closest = function closest(selector: any): any {
    // eslint-disable-next-line consistent-this
    let element: (Node & ParentNode) | null = this;

    while (element && element.nodeType === 1) {
      if ((element as Element).matches(selector)) {
        return element;
      }

      element = element.parentNode;
    }

    return null;
  };
}

// polyfill for IE
(function (window: Window): boolean {
  try {
    // eslint-disable-next-line no-new
    new (window as any).MouseEvent('test', {});

    return false;
  } catch (e) {
    // Need to polyfill - fall through
  }

  // Polyfills DOM4 MouseEvent

  const MouseEvent = function (eventType: string, params: any): MouseEvent {
    const _params: any = params || {
      bubbles: false,
      cancelable: false
    };

    const mouseEvent = document.createEvent('MouseEvent');

    mouseEvent.initMouseEvent(eventType, _params.bubbles, _params.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    return mouseEvent;
  };

  MouseEvent.prototype = Event.prototype;

  (window as any).MouseEvent = MouseEvent;

  return true;
}(window));

Number.isInteger = Number.isInteger || function (value: any): boolean {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};
