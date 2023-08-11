import { Css } from './css';

describe('Utils', () => {

  describe('Css', () => {

    describe('#isLargeText', () => {

      it('should indicate that text is large when font size is 14pt and font weight is bold', () => {
        const el = document.createElement('div');

        el.style.cssText = 'font-size: 14pt; font-weight: bold;';
        document.body.appendChild(el);

        const isLargeText = Css.isLargeText(el);

        expect(isLargeText).toBeTruthy();

        el.parentNode.removeChild(el);
      });

      it('should indicate that text is not large when font size is 14pt and font weight less than bold', () => {
        const el = document.createElement('div');

        el.style.cssText = 'font-size: 14pt; font-weight: normal;';
        document.body.appendChild(el);

        const isLargeText = Css.isLargeText(el);

        expect(isLargeText).toBeFalsy();

        el.parentNode.removeChild(el);
      });

      it('should indicate that text is large when font size is 18pt', () => {
        const el = document.createElement('div');

        el.style.cssText = 'font-size: 18pt;';
        document.body.appendChild(el);

        const isLargeText = Css.isLargeText(el);

        expect(isLargeText).toBeTruthy();

        el.parentNode.removeChild(el);
      });

    });

    describe('#getComputedStyle', () => {

      it('should return style object for specified element', () => {
        const el = document.createElement('div');

        el.style.cssText = 'position: absolute';
        document.body.appendChild(el);

        const style = Css.getComputedStyle(el);

        expect(style.position).toBe('absolute');

        el.parentNode.removeChild(el);
      });

    });

    describe('#getStyle', () => {

      it('should return style value for specified element and css rule', () => {
        const el = document.createElement('div');

        el.style.cssText = 'position: absolute';
        document.body.appendChild(el);

        const style = Css.getStyle(el, 'position');

        expect(style).toBe('absolute');
        el.parentNode.removeChild(el);
      });

      // TODO: maybe it's worth to check why PhantomJS and JSDOM don't return pseudo-element property value
      if ((/PhantomJS/).test(window.navigator.userAgent) === false && (/jsdom/).test(window.navigator.userAgent) === false) {

        it('should return pseudo-element and it\'s value for specified element', () => {
          const el = document.createElement('div'),
            cssString = 'div:after { content: "test" }',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

          style.appendChild(document.createTextNode(cssString));

          head.appendChild(style);
          document.body.appendChild(el);

          const cssStyleDeclaration = Css.getStyle(el, 'content', ':after');

          expect(cssStyleDeclaration).toBe('"test"');

          el.parentNode.removeChild(el);
          style.parentNode.removeChild(style);
        });

      }

    });

    describe('#getActualDPI', () => {

      it('should return default DPI as per testing environment', () => {
        expect(Css.getActualDPI()).toBe(96);
      });

    });

    describe('#getElementBackgroundImage', () => {
      let element: HTMLElement = null;

      beforeEach(() => {
        element = document.createElement('div');
        document.body.appendChild(element);
      });

      afterEach(() => {
        element.parentNode.removeChild(element);
      });

      it('should return null if theres no background image', () => {
        expect(Css.getElementBackgroundImage(element)).toEqual(null);
      });

      it('should return background image of the element', () => {
        const imageUrl = '/abc123.jpeg';

        element.style.cssText = `background-image: url("${imageUrl}");`;

        expect(Css.getElementBackgroundImage(element)).toContain(imageUrl);
      });

      it('should return background image of a parent element', () => {
        const imageUrl = '/abc1234.jpeg';

        element.innerHTML = '<div><div id="testElement"></div></div>';
        element.style.cssText = `background-image: url("${imageUrl}");`;

        const testElement: HTMLElement = element.querySelector('#testElement');

        expect(Css.getElementBackgroundImage(testElement, true)).toContain(imageUrl);
      });

    });

  });
});
