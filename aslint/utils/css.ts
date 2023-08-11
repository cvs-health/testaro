import { TinyColor } from '@ctrl/tinycolor';

import { Env } from './env';
import { Async } from './async';
import { CommonUtility } from './common';
import { ObjectUtility } from './object';

export class Css {
  private static cachedDPI: number | null = null;
  private static get floatStyle(): string {
    return typeof document.documentElement.style.cssFloat === 'string' ? 'cssFloat' : 'styleFloat';
  }

  constructor() { }

  public static getComputedStyle(element: Element, pseudoElt?: string): CSSStyleDeclaration | null {
    if (ObjectUtility.isHtmlElement(element)) {
      return document && document.defaultView && document.defaultView.getComputedStyle(element, pseudoElt || null);
    }

    return null;
  }

  // Note: regarding z-index - if browser is applying the z-index on a static element then the "auto" value is a correct value.
  public static getStyle(element: Element, styleProp: string, pseudoElt?: string): string | null {
    const isHtmlElement: boolean = ObjectUtility.isHtmlElement(element);

    if (isHtmlElement === false) {
      return null;
    }

    if (ObjectUtility.isHostMethod(window, 'getComputedStyle')) {
      return window.getComputedStyle(element, pseudoElt || null).getPropertyValue(styleProp);
    }

    if (ObjectUtility.isRealObjectProperty(document, 'defaultView')) {
      return document && document.defaultView && document.defaultView.getComputedStyle(element, pseudoElt || null).getPropertyValue(styleProp);
    }

    return null;
  }

  public static setStyle(element: HTMLElement, style: string, value: string): void {
    let styleProp: string = style;

    if (styleProp === 'float') {
      styleProp = Css.floatStyle;
    }

    element.style.setProperty(styleProp, value);
  }

  public static getSize(element: Element): ClientRect | DOMRect {
    return element.getBoundingClientRect();
  }

  public static getBackgroundColor(element: Element): TinyColor | null {
    let node: Element = element;
    const backgroundStyle: string | null = Css.getStyle(node, 'background-color');

    if (backgroundStyle === null) {
      console.warn('[Css.getBackgroundColor] CSS style background color is not available for element', element);

      return new TinyColor('transparent');
    }

    let color: TinyColor = new TinyColor(backgroundStyle);

    if (color.toName() !== 'transparent') {
      return color;
    }

    while (CommonUtility.isHtmlDocument(node) === false) {
      const backgroundColorStyle: string | null = Css.getStyle(node, 'background-color');

      color = typeof backgroundColorStyle === 'string' ? new TinyColor(backgroundColorStyle) : new TinyColor('transparent');

      if (color.toName() !== 'transparent') {
        return color;
      }

      node = node.parentNode as Element;
    }

    if (CommonUtility.isHtmlDocument(node)) {
      color = new TinyColor('transparent');
    }

    return color;
  }

  public static getElementBackgroundImage(element: Element, includeParents: boolean = false): string | null {
    const elementStyles: CSSStyleDeclaration | null = Css.getComputedStyle(element);

    if (elementStyles === null) {
      return null;
    }

    if (typeof elementStyles.backgroundImage !== 'string' || ['', 'none'].includes(elementStyles.backgroundImage.trim()) === false) {
      return elementStyles.backgroundImage;
    }

    if (includeParents) {
      let currentElement: Element | null = element.parentElement;

      while (currentElement !== null) {
        const styles: CSSStyleDeclaration | null = Css.getComputedStyle(currentElement);

        if (styles) {
          if (typeof styles.backgroundImage !== 'string' || ['', 'none'].includes(styles.backgroundImage.trim()) === false) {
            return styles.backgroundImage;
          }
        }

        currentElement = currentElement.parentElement;
      }
    }

    return null;
  }

  public static getActualDPI(): number {
    if (Env.isTest) {
      return 96;
    }

    if (typeof this.cachedDPI === 'number') {
      return this.cachedDPI;
    }
    const dpiTestElement: HTMLDivElement = document.createElement('div');

    dpiTestElement.style.position = 'fixed';
    dpiTestElement.style.top = '-999999px';
    dpiTestElement.style.left = '-999999px';
    dpiTestElement.style.width = '1in';
    dpiTestElement.style.height = '1in';

    document.body.appendChild(dpiTestElement);

    const elementWidthStyle: string | null = Css.getStyle(dpiTestElement, 'width');
    const elementHeightStyle: string | null = Css.getStyle(dpiTestElement, 'height');

    if (elementWidthStyle === null || elementHeightStyle === null) {
      this.cachedDPI = 0;
    } else {
      this.cachedDPI = (parseInt(elementWidthStyle, 10) + parseInt(elementHeightStyle, 10)) / 2;
    }


    dpiTestElement.remove();

    const clearCachedDPI: () => void = (): void => {
      this.cachedDPI = null;
    };

    Async.run(clearCachedDPI, this, 1000);

    return this.cachedDPI;
  }

  public static covertPtToPx(val: string | number, considerDPI: boolean = false): number {
    const dpi: number = considerDPI ? this.getActualDPI() : 96;

    return typeof val === 'number' || val.endsWith('px') === false ? Math.round((parseInt(val.toString(), 10) * dpi) / 72) : parseInt(val.toString(), 10);
  }

  public static covertPxToPt(val: string | number, considerDPI: boolean = false): number {
    const dpi: number = (considerDPI ? this.getActualDPI() : 96);

    return typeof val === 'number' || val.endsWith('pt') === false ? Math.round((parseInt(val.toString(), 10) * 72) / dpi) : parseInt(val.toString(), 10);
  }

  public static isLargeText(element: Element): boolean {
    const elementFontSize: string | null = Css.getStyle(element, 'font-size');

    if (elementFontSize === null) {
      return false;
    }

    const elementFontWeight: string | null = Css.getStyle(element, 'font-weight');
    const fontSizePt: number = Css.covertPxToPt(elementFontSize, true);
    const isFontBold: boolean = elementFontWeight !== null && (elementFontWeight === 'bold' || parseInt(elementFontWeight, 10) >= 700);

    return isFontBold && fontSizePt >= 14 || fontSizePt >= 18;
  }

  public static isCssTextTransformUsed(element: HTMLElement): boolean {
    return Css.getStyle(element, 'text-transform') === 'uppercase' || typeof element.style === 'object' && element.style.textTransform.toLowerCase() === 'uppercase';
  }

}
