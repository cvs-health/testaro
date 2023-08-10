import { DomUtility } from '../../../../../../../utils/dom';
import { Validator } from '../../../../../../../validator';
import { LinkWithUnclearPurpose } from './link-with-unclear-purpose';

describe('Rules', () => {

  describe('LinkWithUnclearPurpose', () => {

    it('should indicate that class exists', () => {
      expect(LinkWithUnclearPurpose).toBeDefined();
    });

    let fakeDom;
    const selector = 'a:not(:empty)';

    new LinkWithUnclearPurpose().registerValidator();

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

    it('should return no reports when there are links with unclear purpose text', () => {
      fakeDom.innerHTML = '<a href="fake.html">Test</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new LinkWithUnclearPurpose().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is a link with unclear purpose text', () => {
      fakeDom.innerHTML = '<a href="fake.html">Click here</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new LinkWithUnclearPurpose().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This anchor text content <code>click here</code> is unclear out of context.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('link-with-unclear-purpose');
    });

    it('should return 1 report when there is a link with unclear purpose text, but the text contains white space', () => {
      const zeroWidthSpace: string = String.fromCharCode(8203);

      fakeDom.innerHTML = `<a href="fake.html">Click${zeroWidthSpace}here</a>`;
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new LinkWithUnclearPurpose().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This anchor text content <code>click here</code> is unclear out of context.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('link-with-unclear-purpose');
    });

  });
});
