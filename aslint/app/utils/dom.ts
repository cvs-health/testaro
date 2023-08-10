import { TinyColor } from '@ctrl/tinycolor';

import { NATIVELY_DISABLEABLE } from '../constants/nativelyDisableable';
import { NODE_TYPE } from '../constants/nodeType';
import { Css } from './css';
import { TextUtility } from './text';
import { ObjectUtility } from './object';
import { Context, IContextElement, IHtmlInfo } from '../interfaces/context.interface';

type FormElement = HTMLInputElement | HTMLOutputElement | HTMLTextAreaElement;

export class DomUtility {
  private static regExpTest: RegExp['test'] = RegExp.prototype.test;
  private static nonSpaceRe: RegExp = /\S/;

  public static isNativelyDisableable(element: Element | Node & ParentNode): boolean {
    return element.nodeName.toUpperCase() in NATIVELY_DISABLEABLE;
  }

  public static getBodyElement(): HTMLElement | HTMLCollectionOf<HTMLBodyElement> {
    return document.body ? document.body : document.getElementsByTagName('body')[0];
  }

  public static getSelectedOption(select: HTMLSelectElement): any {
    const options: HTMLOptionsCollection = select.options;
    const len: number = options.length - 1;

    for (let i: number = 0; i < len; i += 1) {
      if (options[i].selected) {
        return options[i];
      }
    }

    return null;
  }
  /**
   * Get text from a given node
   *
   * @static
   * @param {Node} node
   * @param {boolean} [filterEmpty=false] Set true to filter out empty text nodes. Default: false
   * @param {boolean} [safeTrim=false] Set true to use more advanced trim. Default: false
   * @returns {string}
   * @memberof DomUtility
   */

  public static getText(node: Node, filterEmpty: boolean = false, safeTrim: boolean = false): string {
    const element: Node = node;
    const notFound: string = '';
    const nodeList: string[] = [];

    if (ObjectUtility.isHtmlElement(element) === false) {
      return notFound;
    }

    let filterCallback: NodeFilter | null | undefined = null;

    if (filterEmpty) {

      if (safeTrim) {
        filterCallback = {
          acceptNode: (_node: Node): number => {
            return (TextUtility.safeTrim(_node.nodeValue!).length > 0) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        };
      } else {
        filterCallback = {
          acceptNode: (_node: Node): number => {
            return (_node.nodeValue!.trim().length > 0) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        };
      }
    }

    const treeWalker: TreeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, filterCallback);

    while (treeWalker.nextNode()) {
      nodeList.push((treeWalker.currentNode as Text).data);
    }

    return nodeList.join('');
  }

  public static getTextFromNode(node: Node): string {
    let text: string = '';
    let option: HTMLOptionElement;

    switch (node.nodeName.toLowerCase()) {
      case 'img':
      case 'area':
        if ((node as HTMLImageElement | HTMLAreaElement).alt && (node as HTMLImageElement | HTMLAreaElement).alt.length) {
          text += (node as HTMLImageElement | HTMLAreaElement).alt;
        }
        break;

      case 'input':
      case 'output':
      case 'textarea':
        if (
          (node as FormElement).type === 'email' ||
          (node as FormElement).type === 'number' ||
          (node as FormElement).type === 'text' ||
          (node as FormElement).type === 'textarea'
        ) {
          text += (node as FormElement).value;
        } else if (
          (node as FormElement).type === 'image' &&
          typeof (node as HTMLInputElement).alt === 'string' &&
          (node as HTMLInputElement).alt.length
        ) {
          text += (node as HTMLInputElement).alt;
        }
        break;

      case 'select':
        option = DomUtility.getSelectedOption(node as HTMLSelectElement);
        text += DomUtility.getText(option);
        break;

      default:
        break;
    }

    return text;
  }

  public static getTextFromNodes(nodes: Node[] | NodeListOf<ChildNode>): string {
    const len: number = nodes ? nodes.length : 0;
    let node: Node;
    let text: string = '';

    for (let i: number = 0; i < len; i += 1) {
      node = nodes[i];

      if (node.nodeType === NODE_TYPE.TEXT_NODE) {
        text += (node as Text).data;
      } else if (node.nodeType === NODE_TYPE.ELEMENT_NODE) {
        switch (node.nodeName.toLowerCase()) {
          case 'img':
          case 'area':
          case 'input':
          case 'output':
          case 'textarea':
          case 'select':
            text += DomUtility.getTextFromNode(node);
            break;

          default:
            if (nodes[i].childNodes) {
              text += DomUtility.getTextFromNodes(nodes[i].childNodes);
            }
            break;
        }
      }
    }

    return text;
  }

  public static testRegExp(re: RegExp, string: string): boolean {
    return DomUtility.regExpTest.call(re, string);
  }

  public static isWhitespace(str: string | null): boolean {
    if (typeof str !== 'string') {
      console.warn(`[DomUtility.isWhitespace] Invalid str type (got: ${typeof str})`);

      return false;
    }

    return DomUtility.testRegExp(DomUtility.nonSpaceRe, str) === false;
  }

  public static isWhitespaceText(node: Node): boolean {
    return node.nodeType === NODE_TYPE.TEXT_NODE && DomUtility.isWhitespace(node.nodeValue);
  }

  public static textContainsOnlyWhiteSpaces(str: string): boolean {
    return (/^\s*$/).test(str);
  }

  public static hasNonWhitespacesContent(element: HTMLElement): boolean {
    const text: string | null = element.textContent;

    return typeof text === 'string' ? this.textContainsOnlyWhiteSpaces(text) : false;
  }

  public static isEmptyElement(element: Node): boolean {
    const excludeCommentNodes = (node: ChildNode): boolean => {
      return node.nodeType !== NODE_TYPE.COMMENT_NODE;
    };

    const nonCommentChildNodes: ChildNode[] = Array.from(element.childNodes).filter(excludeCommentNodes);

    return nonCommentChildNodes.length === 0;
  }

  public static getParentElement(element: HTMLElement, nodeName: string): HTMLElement | null {
    let parent: HTMLElement | null = element;

    if (typeof nodeName !== 'string') {
      return null;
    }

    while (parent && parent.nodeName) {
      if (parent.nodeName && parent.nodeName.toLowerCase() === nodeName) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return null;
  }

  public static getHighestZindex(): number {
    const elms: HTMLCollectionOf<Element> = document.getElementsByTagName('*');
    const len: number = elms.length;
    const zIndexes: number[] = [];
    let zIndex: string | null;

    for (let i: number = 0; i < len; i += 1) {
      zIndex = Css.getStyle(elms[i] as HTMLElement, 'z-index');

      if (zIndex !== null && zIndex !== 'auto') {
        zIndexes.push(Number(zIndex));
      }
    }

    if (zIndexes.length === 0) {
      return 0;
    }

    return Math.max(...zIndexes);
  }

  public static contains(parentNode: Element, childNode: Element): boolean {

    if (ObjectUtility.isHtmlElement(parentNode) === false) {
      return false;
    }

    if (ObjectUtility.isHostMethod(parentNode, 'contains')) {
      return parentNode.contains(childNode);
    }

    return Boolean(parentNode.compareDocumentPosition(childNode) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  public static querySelectorAll(selector: string, context?: any): HTMLElement[] {
    let result: HTMLElement[] = context ? context.querySelectorAll(selector) : document.querySelectorAll(selector);

    if (result) {
      result = Array.from(result);
    }

    return result;
  }

  /**
   * Note: proxiedNode is used by CloudFlare Rocket Loader
   * See https://support.cloudflare.com/hc/en-us/articles/200168056-What-does-Rocket-Loader-do-
   */

  public static querySelectorAllExclude(selector: string, context?: Context | null, excludeContainers?: HTMLElement | null | undefined | (HTMLElement | null)[], excludeElements?: HTMLElement | null | undefined | HTMLElement[]): Element[] | null {
    const queryResults: NodeListOf<Element> = context ? context.querySelectorAll(selector) : document.querySelectorAll(selector);

    let _excludeContainers: (HTMLElement | null)[] = [];

    if (Array.isArray(excludeContainers)) {
      _excludeContainers = excludeContainers;
    } else if (excludeContainers) {
      _excludeContainers = [excludeContainers];
    }

    let _excludeElements: HTMLElement[] = [];

    if (Array.isArray(excludeElements)) {
      _excludeElements = excludeElements;
    } else if (excludeElements) {
      _excludeElements = [excludeElements];
    }

    let result: NodeListOf<Element> | Element[] = Array.from(queryResults);

    if (queryResults.length === 0) {
      return result;
    }

    const excludedElements = (node: Element): boolean => {
      const foundedEl: HTMLElement = (node as any).proxiedNode || node;

      const findElement = (excludedElement: HTMLElement): boolean => {
        return foundedEl === excludedElement;
      };

      const index: number = _excludeElements.findIndex(findElement);

      return index === -1;
    };

    const excludeFromContainers = (node: Element): boolean => {
      const foundedEl: HTMLElement = (node as any).proxiedNode || node;

      const findElement = (containerFromExclude: HTMLElement | null): boolean => {
        if (containerFromExclude === null) {
          return false;
        }

        return DomUtility.contains(containerFromExclude, foundedEl);
      };

      const index: number = _excludeContainers.findIndex(findElement);

      return index === -1;
    };

    const excludeContainersItself = (node: Element): boolean => {
      const foundedEl: HTMLElement = (node as any).proxiedNode || node;

      const findElement = (containerFromExclude: HTMLElement | null): boolean => {
        return foundedEl === containerFromExclude;
      };

      const index: number = _excludeContainers.findIndex(findElement);

      return index === -1;
    };

    result = result.filter(excludeFromContainers).filter(excludeContainersItself)
      .filter(excludedElements);

    return result;
  }

  public static getOuterDimensions(el: HTMLElement): { height: number; width: number } {
    const dimensions: { height: number; width: number } = {
      height: 0,
      width: 0
    };

    if (document.documentElement && typeof document.documentElement.offsetWidth === 'number') {
      dimensions.height = el.offsetHeight;
      dimensions.width = el.offsetWidth;
    }

    return dimensions;
  }

  public static getInnerDimensions(el: HTMLElement): { height: number; width: number } {
    const dimensions: { height: number; width: number } = {
      height: 0,
      width: 0
    };

    if (document.documentElement && typeof document.documentElement.clientWidth === 'number') {
      dimensions.height = el.clientHeight;
      dimensions.width = el.clientWidth;
    }

    return dimensions;
  }

  public static createCSS(content: string, id?: string, media?: string): HTMLStyleElement {
    if (content === null) {
      throw new Error(`[DomUtility.createCSS] passed content is not a string. Is type ${typeof content}`);
    }

    const head: HTMLHeadElement = document.head;
    const style: HTMLStyleElement = document.createElement('style');

    if (typeof id === 'string') {
      style.id = id;
    }

    if (typeof media === 'string' && media.length > 0) {
      style.setAttribute('media', media);
    }

    if (typeof style['styleSheet' as keyof typeof style] === 'object') {
      (style['styleSheet' as keyof typeof style] as unknown as CSSRule).cssText = content;
    } else {
      style.appendChild(document.createTextNode(content));
    }

    head.appendChild(style);

    return style;
  }

  public static getInnerHTML(element: Element): string {
    return element.innerHTML;
  }

  public static getOuterHTML(element: Node): string {
    const clone: Node = element.cloneNode(false);

    return (clone as Element).outerHTML;
  }

  public static getNodeHTML(element: Element): string {
    return element.outerHTML;
  }

  public static getEscapedNodeHTML(element: Element): string {
    return TextUtility.escape(DomUtility.getNodeHTML(element));
  }

  public static getEscapedInnerHTML(element: Element): string {
    return TextUtility.escape(DomUtility.getInnerHTML(element));
  }

  public static getEscapedOuterHTML(element: Element | null): string {
    if (element) {
      return TextUtility.escape(DomUtility.getOuterHTML(element));
    }

    return '';
  }

  public static getEscapedOuterTruncatedHTML(element: Context | null): string {
    if (element === null || ('innerHTML' in element === false) && ('outerHTML' in element === false)) {
      return '';
    }

    const tags: string[] = DomUtility.getOuterHTML(element).split('>');
    let html: string = '';

    if (tags.length === 3) {
      // <tag></tag>
      html = `${tags[0]}>${TextUtility.truncateInTheMiddle((element as Element).innerHTML)}${tags[1]}>`;
    } else if (tags.length === 2) {
      // <tag/>
      html = TextUtility.truncateInTheMiddle((element as Element).outerHTML);
    }

    return TextUtility.escape(html);
  }

  public static nodesToText(node: Node): string {
    if (node.childNodes.length > 0) {
      return DomUtility.getTextFromNodes(node.childNodes);
    }

    return DomUtility.getTextFromNode(node);
  }

  public static getNodeWithTextContent(node: Node, limitTextContent?: number, toUpperCase?: boolean): string {
    const clone: Node = node.cloneNode(false);
    let innerText: string | null = node.textContent;

    if (innerText === null) {
      console.warn(`[DomUtility.getNodeWithTextContent] node.textContent got null value`, node);

      return '';
    }

    if (typeof limitTextContent === 'number') {
      innerText = TextUtility.truncateWords(innerText, limitTextContent);
    }

    if (typeof toUpperCase === 'boolean') {
      innerText = innerText.toUpperCase();
    }

    clone.textContent = innerText;

    return TextUtility.escape((clone as Element).outerHTML);
  }

  public static empty(node: Node): Node {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }

    return node;
  }

  public static remove(node: Node): void {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  public static removeScript(url: string): void {
    const scripts: HTMLCollectionOf<HTMLScriptElement> = document.scripts;
    const len: number = scripts.length;

    for (let i: number = 0; i < len; i += 1) {
      const script: HTMLScriptElement = scripts[i];

      if (script.src === url && script.parentNode !== null) {
        script.parentNode.removeChild(scripts[i]);
        break;
      }
    }
  }

  // Note about XPath: https://www.bennadel.com/blog/2142-using-and-expressions-in-xpath-xml-search-directives-in-coldfusion.htm
  public static getXPath(el: Context): string {
    let element: Element | Node & ParentNode = el;
    let parent: Element | Node & ParentNode | null;
    let sames: Node[];
    let elementType: number;
    let result = '';

    const filterNode = (_node: Node): void => {
      if (_node.nodeName === element.nodeName) {
        sames.push(_node);
      }
    };

    if (element instanceof Node === false) {
      return result;
    }

    parent = el.parentNode;

    while (parent !== null) {
      elementType = element.nodeType;
      sames = [];
      parent.childNodes.forEach(filterNode);

      if (elementType === NODE_TYPE.ELEMENT_NODE) {

        const nodeName: string = element.nodeName.toLowerCase();
        const name: string = nodeName === 'svg' ? `*[name()='${nodeName}']` : nodeName;

        result = `/${name}${sames.length > 1 ? `[${[].indexOf.call(sames, element as never) + 1}]` : ''}${result}`;
      } else if (elementType === NODE_TYPE.TEXT_NODE) {
        result = `/text()${result}`;
      } else if (elementType === NODE_TYPE.ATTRIBUTE_NODE) {
        result = `/@${element.nodeName.toLowerCase()}${result}`;
      } else if (elementType === NODE_TYPE.COMMENT_NODE) {
        result = `/comment()${result}`;
      }

      element = parent;
      parent = element.parentNode;
    }

    return `./${result}`;
  }

  public static setScrollPositionToElement(element: Element): boolean {
    if (ObjectUtility.isHostMethod(element, 'scrollIntoView')) {
      element.scrollIntoView();

      return true;
    }

    return false;
  }

  public static firstElementChild(context: Element): Element | null {
    return context.firstElementChild;
  }

  public static isVisibleForAssistiveTechnologies(el: Element): boolean {
    let ariaLabelledByDestination: HTMLElement | null;

    if (ObjectUtility.isHtmlElement(el) === false) {
      return false;
    }

    const clientRect: ClientRect | DOMRect = el.getBoundingClientRect();
    const ariaHidden: string | null = el.getAttribute('aria-hidden');
    const ariaLabel: string | null = el.getAttribute('aria-label');
    const ariaLabelledBy: string | null = el.getAttribute('aria-labelledby');
    const styles: CSSStyleDeclaration | null = Css.getComputedStyle(el);

    if (styles === null) {
      return false;
    }

    if (styles.display === 'none' || styles.visibility === 'hidden') {
      return false;
    }

    if (ariaHidden && ariaHidden === 'true') {
      return false;
    }

    if (ariaLabel && ariaLabel.length > 0) {
      return true;
    }

    if (ariaLabelledBy) {
      ariaLabelledByDestination = document.getElementById(ariaLabelledBy);

      if (ariaLabelledByDestination === null) {
        return false;
      }
    }

    return clientRect.width >= 1 || clientRect.height >= 1;
  }

  public static getPageSize(): { height: number; width: number } {
    const body: HTMLBodyElement = DomUtility.getBodyElement() as HTMLBodyElement;
    const root: HTMLElement = DomUtility.getRootElement();
    const pageHeight: number = Math.max(body.scrollHeight, body.offsetHeight, root.clientHeight, root.scrollHeight, root.offsetHeight);
    const pageWidth: number = Math.max(body.scrollWidth, body.offsetWidth, root.clientWidth, root.scrollWidth, root.offsetWidth);

    return {
      height: pageHeight,
      width: pageWidth
    };
  }

  public static getElementAttribute(element: Element, attribute: string): null | Attr {
    return element.attributes.getNamedItem(attribute);
  }

  public static isRangeOffPage(range: Range): boolean {
    const rect: DOMRect = range.getBoundingClientRect();
    const pageSize: { height: number; width: number } = DomUtility.getPageSize();

    return ((rect.x + rect.width) < 0 || (rect.y + rect.height) < 0 || (rect.x > pageSize.width || rect.y > pageSize.height));
  }

  public static isElementOffPage(element: Element): boolean {
    const rect: DOMRect = element.getBoundingClientRect();
    const pageSize: { height: number; width: number } = DomUtility.getPageSize();

    return ((rect.x + rect.width) < 0 || (rect.y + rect.height) < 0 || (rect.x > pageSize.width || rect.y > pageSize.height));
  }

  public static isAnyPartOfElementRenderedOnPage(element: Element): boolean {
    const rect: ClientRect | DOMRect = element.getBoundingClientRect();
    const pageSize: { height: number; width: number } = DomUtility.getPageSize();

    // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
    const verticalInView: boolean = (rect.top <= pageSize.height) && ((rect.top + rect.height) >= 0);
    const horizontalInView: boolean = (rect.left <= pageSize.width) && ((rect.left + rect.width) >= 0);

    return (verticalInView && horizontalInView);
  }

  public static isElementInViewport(element: Element): boolean {
    const clientRect: ClientRect | DOMRect = element.getBoundingClientRect();

    /*
     * offsetParent returns null when the element has style.display set to "none"
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
     * element.offsetParent
     */

    return (
      clientRect.top >= 0 &&
      clientRect.left >= 0 &&
      clientRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      clientRect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  public static isElementHidden(element: Element): boolean {
    if (!(element instanceof (element.ownerDocument.defaultView as any).HTMLElement)) {
      return false;
    }

    const style: CSSStyleDeclaration = window.getComputedStyle(element, null);

    return style.display === 'none' || style.visibility === 'collapse' || style.visibility === 'hidden' || style.opacity === '0' || (element as HTMLElement).offsetHeight === 0;
  }

  public static isElementVisible(element: Element | HTMLElement): boolean {
    if (ObjectUtility.isHtmlElement(element) === false) {
      return false;
    }

    const rect: ClientRect | DOMRect = element.getBoundingClientRect();
    const style: CSSStyleDeclaration = window.getComputedStyle(element, null);

    if (typeof (element as HTMLElement).hidden === 'boolean' && (element as HTMLElement).hidden === true) {
      return false;
    }

    if (style.display === 'none') {
      return false;
    }

    if (style.visibility === 'collapse' || style.visibility === 'hidden') {
      return false;
    }

    if (!isNaN(parseFloat(style.opacity)) && Number(style.opacity) < 0.1) {
      return false;
    }

    let elementSize: number = (element as HTMLElement).offsetWidth + (element as HTMLElement).offsetHeight;

    if (typeof rect === 'object' && typeof rect.height === 'number' && typeof rect.width === 'number') {
      elementSize += rect.height + rect.width;
    }

    if (elementSize === 0) {
      return false;
    }

    if (typeof rect === 'object' && typeof rect.height === 'number' && typeof rect.width === 'number' && rect.width === 1 && rect.height === 1 && style.overflow === 'hidden') {
      return false;
    }

    if (DomUtility.isAnyPartOfElementRenderedOnPage(element) === false) {
      return false;
    }

    return true;
  }

  public static getRootElement(): HTMLElement {
    return document.documentElement || document.getElementsByTagName('html')[0];
  }

  public static isHiddenByParent(element: Element): boolean {
    let result: boolean = false;
    const root: HTMLElement = DomUtility.getRootElement();
    let parent: Element | null = element;

    while (parent !== root) {
      if (parent && DomUtility.isElementVisible(parent) === false) {
        result = true;

        break;
      }

      if (parent === null || parent.parentElement === null) {
        break;
      }

      parent = parent.parentElement;
    }

    return result;
  }

  public static isHiddenForAT(element: Element): boolean {
    let result: boolean = false;
    const root: HTMLElement = DomUtility.getRootElement();
    let parent: Element | null = element;
    let ariaHidden: string | null = null;

    while (parent !== root) {
      if (parent === null || parent.parentElement === null) {
        break;
      }

      ariaHidden = parent.getAttribute('aria-hidden');

      if (parent && typeof ariaHidden === 'string' && ariaHidden === 'true') {
        result = true;

        break;
      }

      parent = parent.parentElement;
    }

    return result;
  }

  public static getTextFromDescendantContent(node: Element): string {
    const onlyTextNodes = (previousValue: string, currentValue: ChildNode, _currentIndex: number, _array: ChildNode[]): string => {
      if (currentValue.nodeType === NODE_TYPE.TEXT_NODE) {
        // eslint-disable-next-line no-param-reassign
        previousValue += (currentValue as CharacterData).data;
      }

      return previousValue;
    };

    return Array.from(node.childNodes).reduce(onlyTextNodes, '');
  }

  /**
   * Determine if element has any direct text descendant.
   *
   * @static
   * @param {Node} element
   * @returns {boolean} true if element has direct text descendant; false otherwise
   * @memberof DomUtility
   */

  public static hasDirectTextDescendant(element: HTMLElement): boolean {
    const childs: NodeListOf<ChildNode> = element.childNodes;
    const len: number = childs.length;
    let result: boolean = false;

    for (let i: number = 0; i < len; i += 1) {
      if (childs[i].nodeType === NODE_TYPE.TEXT_NODE) {
        result = true;

        break;
      }
    }

    return result;
  }

  public static isElementDisabled(element: Element): boolean {
    let parent: (Node & ParentNode) | null = element;

    if (element.matches('[aria-disabled=true], [aria-disabled=true] *')) {
      return true;
    }

    if (!DomUtility.isNativelyDisableable(element)) {
      return false;
    }

    while (parent && parent.nodeName) {
      if (DomUtility.isNativelyDisableable(parent) && (parent as Element).hasAttribute('disabled')) {
        return true;
      }

      if (parent === null || parent.parentNode === null) {
        break;
      }

      parent = parent.parentNode;
    }

    return false;
  }

  public static canSetFocus(element: Element): boolean {
    return ObjectUtility.isHostMethod(element, 'focus');
  }

  public static isFocusableElement(element: HTMLOrSVGElement): boolean {
    const originalFocus: Element | null = document.activeElement;
    let result: boolean = false;

    if (originalFocus === null) {
      return result;
    }

    if (typeof element.focus === 'function') {
      element.focus();
      result = element === document.activeElement as unknown as HTMLOrSVGElement;

      (originalFocus as unknown as HTMLOrSVGElement).focus();
    }

    return result;
  }

  public static toJSON(node: Element | ChildNode): string {
    const obj: any = {
      nodeType: node.nodeType
    };
    const attrs: NamedNodeMap = (node as Element).attributes;
    let attr: Attr;
    let len: number;

    if (node.nodeName) {
      obj.nodeName = node.nodeName.toLowerCase();
    }

    if (node.nodeValue) {
      obj.nodeValue = node.nodeValue;
    }

    if (attrs) {
      len = attrs.length;
      obj.attributes = [len];

      for (let i: number = 0; i < len; i += 1) {
        attr = attrs[i];
        obj.attributes[i] = [attr.nodeName, attr.value];
      }
    }

    const childNodes: NodeListOf<ChildNode> = node.childNodes;

    if (childNodes.length > 0) {
      len = childNodes.length;
      obj.childNodes = new Array(len);

      for (let i: number = 0; i < len; i += 1) {
        obj.childNodes[i] = DomUtility.toJSON(childNodes[i]);
      }
    }

    return obj;
  }

  public static insertAfter(newElement: Element, targetElement: Element): void {
    const parent: (Node & ParentNode) | null = targetElement.parentNode;

    if (parent === null) {
      console.warn('[DomUtility.insertAfter] Unable to insert element after unavailable targetElement', targetElement);

      return;
    }

    if (parent.lastChild === targetElement) {
      parent.appendChild(newElement);
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling);
    }
  }

  public static getIFrameDocument(frame: HTMLIFrameElement): Document | null {
    if (ObjectUtility.isHtmlElement(frame) === false) {
      return null;
    }

    if (ObjectUtility.isHostObjectProperty(frame, 'contentWindow')) {
      return frame.contentWindow ? frame.contentWindow.document : null;
    }

    if (ObjectUtility.isHostObjectProperty(frame, 'contentDocument')) {
      return frame.contentDocument;
    }

    return null;
  }

  public static htmlDecode(input: string): string | null {
    const e: HTMLTextAreaElement = document.createElement('textarea');

    e.innerHTML = input;

    return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
  }

  public static ready(): Promise<void> {
    const checkReadyState = (resolve: Function): void => {
      const onReady = (): void => {
        document.removeEventListener('DOMContentLoaded', onReady, true);
        resolve();
      };

      if (document.readyState !== undefined && document.readyState === 'complete') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', onReady, true);
      }
    };

    return new Promise(checkReadyState);
  }

  public static getElementFromCssSelectorOrXpath(xPathOrCssSelector: string): IContextElement {
    const result: IContextElement = {
      element: null,
      error: null
    };

    if (xPathOrCssSelector.trim().length === 0) {
      return result;
    }

    try {
      result.element = document.querySelector(xPathOrCssSelector);
    } catch (e) {
      result.element = null;
      result.error = e;
    }

    if (ObjectUtility.isHtmlElement(result.element)) {
      return result;
    }

    try {
      const xPathResult: XPathResult = document.evaluate(xPathOrCssSelector, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      let node: Node | null = xPathResult.iterateNext();
      const nodes: Node[] = [];

      while (node) {
        nodes.push(node);
        node = xPathResult.iterateNext();
      }

      if (nodes.length > 0 && ObjectUtility.isHtmlElement(nodes[0])) {
        result.element = nodes[0] as Element;
        result.error = null;
      }
    } catch (e) {
      result.element = null;
      result.error = e;
    }

    return result;
  }

  public static hasElementSemiOpacity(element: Element, styles: CSSStyleDeclaration | null = null): boolean {
    let elementStyles: CSSStyleDeclaration | null = styles;

    if (elementStyles === null) {
      elementStyles = Css.getComputedStyle(element);
    }

    if (elementStyles === null) {
      return false;
    }

    return elementStyles.opacity.length > 0 && Number(elementStyles.opacity) < 1;
  }

  public static hasElementSemiTransparentBackground(element: Element, styles: CSSStyleDeclaration | null = null): boolean {
    let elementStyles: CSSStyleDeclaration | null = styles;

    if (elementStyles === null) {
      elementStyles = Css.getComputedStyle(element);
    }

    if (elementStyles === null) {
      return false;
    }

    const bgColor: TinyColor = new TinyColor(elementStyles.backgroundColor);

    return bgColor.getAlpha() > 0 && bgColor.getAlpha() < 1;
  }

  public static getHtmlInfo(root: Node, skipNodeNames: string[] = ['script', 'style']): IHtmlInfo {
    let htmlSize: number = 0;
    let nodesNum: number = 0;

    const nodeIterator: NodeIterator = document.createNodeIterator(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(node: Node): number {
          return node.nodeType === Node.ELEMENT_NODE && skipNodeNames.includes(node.nodeName.toLowerCase()) || node.nodeType === Node.TEXT_NODE && node.parentNode && skipNodeNames.includes(node.parentNode.nodeName.toLowerCase()) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode: Node | null = nodeIterator.nextNode();

    while (currentNode) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        htmlSize += (currentNode.cloneNode(false) as Element).outerHTML.length;
        nodesNum += 1;
      } else if (currentNode.nodeType === Node.TEXT_NODE && typeof currentNode.textContent === 'string') {
        htmlSize += currentNode.textContent.length;
      }

      currentNode = nodeIterator.nextNode();
    }

    return {
      htmlSize: htmlSize,
      nodesNum: nodesNum
    };
  }

}
