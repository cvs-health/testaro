import { DomUtility } from '../../../../../utils/dom';
import { Validator } from '../../../../../validator';
import { BrokenSamePageLink } from './broken-same-page-link';

describe('Rules', () => {

  describe('BrokenSamePageLink#', () => {

    let fakeDom;
    const selector = 'a';

    new BrokenSamePageLink().registerValidator();

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

    it('should return 1 report when there is a link that have no corresponding target element', () => {
      fakeDom.innerHTML = '<a href="#test">Test link</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new BrokenSamePageLink().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('A link to another location on the page does not have a corresponding target with <code>id="test"</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('broken-same-page-link');
    });

    it('should return no reports when there is a link with corresponding target element', () => {
      fakeDom.innerHTML = '<a href="#test">Test link</a><div id="test">Test div</div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new BrokenSamePageLink().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is a link with an empty hash', () => {
      fakeDom.innerHTML = '<a href="https://www.aslint.org">Test link</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new BrokenSamePageLink().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
