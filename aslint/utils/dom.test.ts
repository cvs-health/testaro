import { DomUtility } from './dom';

describe('Utils', () => {

  describe('DomUtility', () => {

    let fakeDom: HTMLDivElement;

    beforeEach(() => {
      fakeDom = document.createElement('div');
      fakeDom.id = 'fakedom';
      document.body.appendChild(fakeDom);
    });

    afterEach(() => {
      DomUtility.remove(document.getElementById('fakedom'));
      fakeDom = undefined;
    });

    describe('#getRootElement', () => {

      it('should return <html> element', () => {
        const root = DomUtility.getRootElement();

        expect(root.nodeName.toLowerCase()).toBe('html');
      });

    });

    describe('#getBodyElement', () => {

      it('should return <body> element', () => {
        const root = DomUtility.getBodyElement() as HTMLElement;

        expect(root.nodeName.toLowerCase()).toBe('body');
      });

    });

    describe('#getTextFromDescendantContent', () => {

      it('should get all text nodes data from descendant content (text contains no spaces)', () => {

        const el = document.createElement('div');

        el.innerHTML = 'This<p>hello</p>should<span>test</span>be only taken.';

        expect(el.childNodes.length).toBe(5);
        expect(DomUtility.getTextFromDescendantContent(el)).toBe('Thisshouldbe only taken.');
      });

      it('should get all text nodes data from descendant content (text contains spaces)', () => {

        const el = document.createElement('div');

        el.innerHTML = 'This <p>hello</p>should<span>test</span> be only taken.';

        expect(el.childNodes.length).toBe(5);
        expect(DomUtility.getTextFromDescendantContent(el)).toBe('This should be only taken.');
      });

    });

    describe('#isVisibleForAssistiveTechnologies', () => {

      it('should return false if passed non-html argument', () => {
        expect(DomUtility.isVisibleForAssistiveTechnologies({} as HTMLElement)).toBeFalsy();
      });

      it('should return true if node has defined aria-hidden="false" and class .visuallyhidden', () => {
        fakeDom.innerHTML = '<p aria-hidden="false">Test</p>';
        const el = fakeDom.querySelector('p');

        el.style.cssText = 'position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px);';

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeTruthy();
      });

      it('should return true if node has defined aria-hidden="false" and class .sr-only (Bootstrap)', () => {
        fakeDom.innerHTML = '<p aria-hidden="false">Test</p>';
        const el = fakeDom.querySelector('p');

        el.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;';

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeTruthy();
      });

      it('should return true if node has defined aria-hidden="false"', () => {
        fakeDom.innerHTML = '<p aria-hidden="false">Test</p>';
        const el = fakeDom.querySelector('p');

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeTruthy();
      });

      it('should return false if node has defined aria-hidden="true"', () => {
        fakeDom.innerHTML = '<p aria-hidden="true">Test</p>';

        const el = fakeDom.querySelector('p');

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeFalsy();
      });

      it('should return true if node has defined non-empty aria-label', () => {
        fakeDom.innerHTML = '<p aria-label="This is test">Test</p>';

        const el = fakeDom.querySelector('p');

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeTruthy();
      });

      it('should return true if node has defined aria-labelledby and destination defined in aria-labelledby exists', () => {
        fakeDom.innerHTML = '<p aria-labelledby="test">Test</p><span id="test"></span>';

        const el = fakeDom.querySelector('p');

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeTruthy();
      });

      it('should return false if node has defined aria-labelledby and destination defined in aria-labelledby does not exists', () => {
        fakeDom.innerHTML = '<p aria-labelledby="test">Test</p>';

        const el = fakeDom.querySelector('p');

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeFalsy();
      });

      it('should return false if node has defined display: none;', () => {
        fakeDom.innerHTML = '<p>Test</p>';

        const el = fakeDom.querySelector('p');

        el.style.cssText = 'display: none;';

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeFalsy();
      });

      it('should return false if node has defined visibility: hidden;', () => {
        fakeDom.innerHTML = '<p>Test</p>';
        const el = fakeDom.querySelector('p');

        el.style.cssText = 'visibility: hidden;';

        expect(DomUtility.isVisibleForAssistiveTechnologies(el)).toBeFalsy();
      });

    });

    describe('#isEmptyElement', () => {

      it('should determine that element is empty (does not contains any nodes, except comment nodes)', () => {

        fakeDom.innerHTML = '<p></p>';
        expect(DomUtility.isEmptyElement(fakeDom.querySelector('p'))).toBeTruthy();
      });

      it('should determine that element contains only comments and therefore is empty', () => {

        fakeDom.innerHTML = '<p></p>';

        const p = fakeDom.querySelector('p');

        const commentNode: Comment = document.createComment('This is a comment');

        p.appendChild(commentNode);

        expect(DomUtility.isEmptyElement(p)).toBeTruthy();
      });

      it('should determine that element contains content (including whitespaces)', () => {

        fakeDom.innerHTML = '<p>    </p>';
        expect(DomUtility.isEmptyElement(fakeDom.querySelector('p'))).toBeFalsy();

        fakeDom.innerHTML = '<p>    <span>test</span></p>';
        expect(DomUtility.isEmptyElement(fakeDom.querySelector('p'))).toBeFalsy();
      });

    });

    describe('#getParentElement', () => {
      it('should return node if founded parent element', () => {
        fakeDom.innerHTML = '<p><span><em id="test"></em></span></p>';
        const p = fakeDom.querySelector('p');

        expect(DomUtility.getParentElement(fakeDom.querySelector('#test'), 'p')).toBe(p);
      });

    });

    describe('#getXPath', () => {

      it('should return correct xpath for svg', () => {
        fakeDom.innerHTML = '<div><div><div class="test"><svg xmlns="http://www.w3.org/2000/svg"></svg></div></div></div>';

        expect(DomUtility.getXPath(fakeDom.querySelector('svg'))).toBe(`.//html/body/div/div/div/div/*[name()='svg']`);
      });

      it('should return path .//html/body/div/div/div/div for specified node', () => {

        fakeDom.innerHTML = '<div><div><div class="test"><span><em id="test" class="test"></em></span></div></div></div>';
        expect(DomUtility.getXPath(fakeDom.querySelector('div.test'))).toBe('.//html/body/div/div/div/div');
      });

      it('should return path .//html/body/div/p/span/em for specified node', () => {

        fakeDom.innerHTML = '<p><span><em id="test"></em></span></p>';
        expect(DomUtility.getXPath(fakeDom.querySelector('#test'))).toBe('.//html/body/div/p/span/em');
      });

      it('should return path .//html/body/div/p[2]/span/em for specified node with duplicated id', () => {

        fakeDom.innerHTML = '<p><span><em id="test"></em></span></p><p><span><em id="test"></em></span></p>';
        expect(DomUtility.getXPath(fakeDom.querySelectorAll('#test')[1])).toBe('.//html/body/div/p[2]/span/em');
      });

      it('should return path .//html/body/div/p/span for specified node', () => {

        fakeDom.innerHTML = '<p><span><em id="test" class="test"></em></span></p>';
        expect(DomUtility.getXPath(fakeDom.querySelector('span'))).toBe('.//html/body/div/p/span');
      });

      it('should return path .//html/body/div/p for specified node', () => {

        fakeDom.innerHTML = '<p><span><em id="test" class="test"></em></span></p>';
        expect(DomUtility.getXPath(fakeDom.querySelector('p'))).toBe('.//html/body/div/p');
      });

      it('should return path to text node for specified text node', () => {

        fakeDom.innerHTML = '<p><span><em id="test" class="test">test</em></span></p>';
        expect(DomUtility.getXPath(fakeDom.querySelector('em').firstChild as Element)).toBe('.//html/body/div/p/span/em/text()');
      });

      it('should return path (including root) for specified node', () => {

        const temp = document.createElement('div'),
          temp2 = document.createElement('div');

        temp.innerHTML = '<div><div class="testelm"></div></div><div><p>test</p></div>';
        temp2.innerHTML = '<div><div class="testelm"></div></div><div><p>test</p></div>';

        DomUtility.remove(fakeDom);

        document.body.insertBefore(temp, document.body.firstChild);
        document.body.insertBefore(temp2, document.body.firstChild);

        expect(DomUtility.getXPath(document.querySelector('div.testelm'))).toBe('.//html/body/div[1]/div[1]/div');
        DomUtility.remove(temp);
        DomUtility.remove(temp2);
      });

      it('should return empty path for non-DOM object', () => {
        expect(DomUtility.getXPath(null)).toBe('');
      });

    });

    describe('#isElementVisible', () => {

      it('should return true if passed element is positioned inside visible area', () => {
        fakeDom.innerHTML = 'Test visible area';

        expect(DomUtility.isElementVisible(fakeDom)).toBeTruthy();
      });

      it('should return false if passed non-HTML element', () => {
        expect(DomUtility.isElementVisible(null)).toBeFalsy();
        // @ts-ignore
        expect(DomUtility.isElementVisible({})).toBeFalsy();
        // @ts-ignore
        expect(DomUtility.isElementVisible([])).toBeFalsy();
        // @ts-ignore
        expect(DomUtility.isElementVisible('')).toBeFalsy();
      });

      it('should return false if passed element with display: none;', () => {

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'display: none;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();
      });

      it('should return false if passed element with opacity: 0;', () => {

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'opacity: 0;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();
      });

      it('should return false if passed element with visibility: hidden;', () => {

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'visibility: hidden;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();
      });

      it('should return false if passed element is visually hidden, but exposed to AT (here using Bootstrap sr-only)', () => {

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();
      });

      it('should return false if passed element is visually hidden, but exposed to AT (here using CSS clip)', () => {

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px);';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();
      });

      it('should return false if passed element is positioned out of visible area using top: -10000px', () => {
        jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
          return {
            height: 1,
            left: 0,
            top: -10000,
            width: 1
          } as DOMRect;
        });

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'position: absolute; top: -10000px;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();

        (Element.prototype.getBoundingClientRect as jest.Mock).mockReset();
      });

      it('should return false if passed element is positioned out of visible area using bottom: -10000px', () => {
        jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
          return {
            bottom: -10000,
            height: 1,
            left: 0,
            width: 1
          } as DOMRect;
        });

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'position: fixed; bottom: -10000px;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();

        (Element.prototype.getBoundingClientRect as jest.Mock).mockReset();
      });

      it('should return false if passed element is positioned out of visible area using left: -10000px', () => {
        jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
          return {
            height: 1,
            left: -10000,
            top: 0,
            width: 1
          } as DOMRect;
        });

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'position: absolute; left: -10000px;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();

        (Element.prototype.getBoundingClientRect as jest.Mock).mockReset();
      });

      it('should return false if passed element is positioned out of visible area using right: -10000px', () => {
        jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
          return {
            height: 1,
            right: -10000,
            top: 0,
            width: 1
          } as DOMRect;
        });

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'position: fixed; right: -10000px;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();

        (Element.prototype.getBoundingClientRect as jest.Mock).mockReset();
      });

      it('should return false if passed element is visually hidden, but exposed to AT (here using text-indent)', () => {

        fakeDom.innerHTML = 'Test';
        fakeDom.style.cssText = 'position: relative; overflow: hidden; clip: rect(0 0 0 0); margin: -1px; padding: 0; border: 0; cursor: pointer; line-height: 2.5; font-size: 1.5em; border-radius: 40px !important; width: 29px !important; height: 29px; transition: 0.25s ease all; text-indent: -10000px !important;';

        expect(DomUtility.isElementVisible(fakeDom)).toBeFalsy();
      });

    });

    describe('#empty', () => {

      it('should remove whole content from given HTML element with parent node', () => {

        const el = document.createElement('div');

        el.innerHTML = '<p><span>123</span><br/></p>';
        expect(el.childNodes.length).toBe(1);

        const p = el.querySelector('p');

        DomUtility.empty(p);

        expect(p.childNodes.length).toBe(0);
      });

      it('should remove whole content from given HTML element without parent node', () => {

        const el = document.createElement('div');

        el.innerHTML = '<span>123</span><br/>';
        expect(el.childNodes.length).toBe(2);

        DomUtility.empty(el);

        expect(el.childNodes.length).toBe(0);
      });

    });

    describe('#remove', () => {

      it('should remove specified HTML element', () => {

        const el = document.createElement('div');

        el.innerHTML = '<span>123</span><br/>';
        expect(el.childNodes.length).toBe(2);

        DomUtility.remove(el.querySelector('span'));

        expect(el.childNodes.length).toBe(1);
      });

    });

    describe('#getHighestZindex', () => {

      it('should return highest z-index on the page', () => {

        const el = document.createElement('div');

        el.id = 'zindextest';
        el.innerHTML = '<span>123</span><br/>';
        el.style.cssText = 'z-index: 20; position: relative';
        document.body.appendChild(el);

        expect(DomUtility.getHighestZindex()).toBe(20);

        el.remove();
      });

      it('should return null when the highest z-index can not be determined', () => {

        const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

        el.id = 'zindextest';
        el.style.cssText = 'z-index: 20; position: relative';
        document.body.appendChild(el);

        expect(DomUtility.getHighestZindex()).toBe(20);

        el.remove();
      });

    });

    describe('#getIFrameDocument', () => {

      it('should return document object for a given iframe', () => {

        const iframe = document.createElement('iframe');

        document.documentElement.appendChild(iframe);

        expect(DomUtility.getIFrameDocument(iframe).nodeName).toBe('#document');

        iframe.remove();
      });

    });

    describe('#getNodeWithTextContent', () => {

      it('should return escaped text content for a given node', () => {

        const node = document.createElement('div');

        node.innerHTML = '<img src="" alt="alternate content"/><p>this is p</p>';

        document.documentElement.appendChild(node);

        expect(DomUtility.getNodeWithTextContent(node)).toBe('&lt;div&gt;this is p&lt;&#x2F;div&gt;');

        node.remove();
      });

    });

    describe('#getEscapedOuterHTML', () => {

      it('should return escaped outer HTML for a given node', () => {

        const node = document.createElement('div');

        node.innerHTML = '<a href="#" aria-hidden="true">Click here</a>';

        document.documentElement.appendChild(node);

        expect(DomUtility.getEscapedOuterHTML(node)).toBe('&lt;div&gt;&lt;&#x2F;div&gt;');

        node.remove();
      });

    });

    describe('#getEscapedOuterTruncatedHTML', () => {

      it('should return escaped outer HTML with truncated inner HTML in the middle for a given node', () => {

        const node = document.createElement('div');

        node.innerHTML = '<a href="#" aria-hidden="true">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</a>';

        document.documentElement.appendChild(node);

        expect(DomUtility.getEscapedOuterTruncatedHTML(node)).toBe('&lt;div&gt;&lt;a href&#x3D;&quot;#&quot; aria-hidden&#x3D;&quot;true&quot;&gt;Lorem Ipsum is simply dummy text of the [...] g software like Aldus PageMaker including versions of Lorem Ipsum.&lt;&#x2F;a&gt;&lt;&#x2F;div&gt;');

        node.remove();
      });

    });

    describe('#isHiddenForAT', () => {

      it('should indicate that the element is hidden from AT using aria-hidden="true", including parents', () => {

        fakeDom.innerHTML = '<div aria-hidden="true"><span>Test</span></div>';
        const el = fakeDom.querySelector('span');

        expect(DomUtility.isHiddenForAT(el)).toBe(true);
      });

      it('should indicate that the element is not hidden from AT using aria-hidden="true", including parents', () => {

        fakeDom.innerHTML = '<div><span>Test</span></div>';
        const el = fakeDom.querySelector('span');

        expect(DomUtility.isHiddenForAT(el)).toBe(false);
      });

    });

    describe('#isWhitespace', () => {

      it('should determine that the given string contains only whitespaces', () => {

        const node = document.createElement('div');

        node.innerHTML = `  `;

        expect(DomUtility.isWhitespace(node.textContent)).toBe(true);
      });

    });

    describe('#getElementAttribute', () => {

      it('should return null when a given attribute does not exists on specified Element', () => {
        const el: Element = document.createElement('span');
        const attribute: Attr | null = DomUtility.getElementAttribute(el, 'aria-hidden');

        expect(attribute).toBe(null);
      });

      it('should return Attribute object when a given attribute does exists on specified Element', () => {
        const el: Element = document.createElement('span');

        el.setAttribute('aria-hidden', 'true');

        const attribute: Attr | null = DomUtility.getElementAttribute(el, 'aria-hidden');

        expect(attribute instanceof Attr).toBe(true);
        expect(attribute.name).toBe('aria-hidden');
        expect(attribute.value).toBe('true');
      });

    });

    describe('#getHtmlInfo', () => {

      const html: string = '<div class="test"><p>Lorem ipsum...</p></div>';

      it('should return size and number of elements for a given root', () => {
        const root: HTMLElement = DomUtility.getBodyElement() as HTMLElement;

        root.innerHTML = html;

        expect(DomUtility.getHtmlInfo(root)).toEqual({
          htmlSize: html.length + '<body></body>'.length,
          nodesNum: 3
        });
      });

      it('should return size and number of elements for a given root excluding elements skipped by default', () => {
        const root: HTMLElement = DomUtility.getBodyElement() as HTMLElement;
        const dirtyHtml: string = '<div class="test"><p>Lorem ipsum...</p><script>alert(333);</script><style>p { font-weight: bold; }</style></div>';

        root.innerHTML = dirtyHtml;

        expect(DomUtility.getHtmlInfo(root)).toEqual({
          htmlSize: html.length + '<body></body>'.length,
          nodesNum: 3
        });
      });

    });

  });
});
