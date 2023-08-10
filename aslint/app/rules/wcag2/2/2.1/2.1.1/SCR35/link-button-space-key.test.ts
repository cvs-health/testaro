import { LinkButtonSpaceKey } from './link-button-space-key';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('LinkButtonSpaceKey#', () => {

    let fakeDom;
    const selector = 'a[role="button"]';

    new LinkButtonSpaceKey().registerValidator();

    beforeEach(() => {
      fakeDom = document.createElement('div');
      fakeDom.id = 'fakedom';
      document.body.appendChild(fakeDom);

      Validator.reset();
    });

    afterEach(() => {
      DomUtility.remove(document.getElementById('fakedom'));
      fakeDom = undefined;
    });

    it('should return 2 reports when there are 2 anchors with role="button"', () => {
      fakeDom.innerHTML = '<a href="test.html" role="button"></a><a href="test1.html" role="button">Test1</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LinkButtonSpaceKey().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('You have defined attribute <code>role&#x3D;&quot;button&quot;</code> on a <code>&lt;a&gt;</code> element. Make sure the user is able to activate it using the <kbd>ENTER</kbd> and <kbd>SPACE</kbd> keys.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('link-button-space-key');
      expect(Validator.getReport('report_1').message).toBe('You have defined attribute <code>role&#x3D;&quot;button&quot;</code> on a <code>&lt;a&gt;</code> element. Make sure the user is able to activate it using the <kbd>ENTER</kbd> and <kbd>SPACE</kbd> keys.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_1').ruleId).toBe('link-button-space-key');
    });

    it('should return one report when there is anchor with role="button"', () => {
      fakeDom.innerHTML = '<a href="test.html" role="button">    </a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LinkButtonSpaceKey().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined attribute <code>role&#x3D;&quot;button&quot;</code> on a <code>&lt;a&gt;</code> element. Make sure the user is able to activate it using the <kbd>ENTER</kbd> and <kbd>SPACE</kbd> keys.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('link-button-space-key');
    });

    it('should return no reports when there is link with role="button"', () => {
      fakeDom.innerHTML = '<link href="test.html" role="button">Test</link>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LinkButtonSpaceKey().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is anchor with role="image"', () => {
      fakeDom.innerHTML = '<a href="test.html" role="image">Test</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LinkButtonSpaceKey().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is anchor without any role', () => {
      fakeDom.innerHTML = '<a href="test.html">Test</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LinkButtonSpaceKey().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
