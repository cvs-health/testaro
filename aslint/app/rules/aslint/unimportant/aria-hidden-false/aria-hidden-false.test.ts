import { AriaHiddenFalse } from './aria-hidden-false';
import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';

describe('Rules', () => {

  describe('AriaHiddenFalse', () => {

    let fakeDom;
    const selector = 'body [aria-hidden="false"]';

    new AriaHiddenFalse().registerValidator();

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

    it('should return one report when there is an element with aria-hidden="false"', () => {
      fakeDom.innerHTML = '<p aria-hidden="false"></p>';

      const nodes: Element[] = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaHiddenFalse().validate(nodes);

      expect(Validator.getReport('report_0').ruleId).toBe('aria-hidden-false');
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>aria-hidden&#x3D;&quot;false&quot;</code>. Caution, as the child content is always readable by screen readers regardless of setting <code>display: none</code> on any child element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
    });

    it('should return 1 report when there is an element with attribute aria-hidden="false" and style="display: none"', () => {
      fakeDom.innerHTML = '<p aria-hidden="false" style="display: none"></p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaHiddenFalse().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>aria-hidden&#x3D;&quot;false&quot;</code>. Caution, as the child content is always readable by screen readers regardless of setting <code>display: none</code> on any child element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
    });

    it('should return no report when there is an element with attribute aria-hidden="true"', () => {
      fakeDom.innerHTML = '<p aria-hidden="true"></p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaHiddenFalse().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is no element with attribute aria-hidden="false"', () => {
      fakeDom.innerHTML = '<p>test</p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaHiddenFalse().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });

});
