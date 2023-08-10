import { AccessibleSvg } from './accessible-svg';
import { DomUtility } from '../../../../../../utils/dom';
import { Validator } from '../../../../../../validator';

describe('Rules', () => {

  describe('#accessible-svg', () => {

    let fakeDom;

    new AccessibleSvg().registerValidator();

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

    it('should return 1 report for svg without any element or attribute that exposes description to AT', () => {
      fakeDom.innerHTML = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>';

      const nodes = DomUtility.querySelectorAllExclude('svg', fakeDom) as SVGElement[];

      new AccessibleSvg().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The element <code>svg</code> does not have an accessible description. Use one of the following solutions to describe element purpose: <code>&lt;title&gt;, &lt;desc&gt;, &lt;text&gt;, aria-label, aria-labelledby, aria-describedby, aria-roledescription</code>. For decorative purpose add an attribute <code>role="presentation"</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('svg');
      expect(Validator.getReport('report_0').ruleId).toBe('accessible-svg');
    });

    it('should return 1 report for svg with defined tabindex that contains invalid value', () => {
      fakeDom.innerHTML = '<svg version="1.1" tabindex="a" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>';

      const nodes = DomUtility.querySelectorAllExclude('svg', fakeDom) as SVGElement[];

      new AccessibleSvg().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);

      expect(Validator.getReport('report_0').message).toBe('1. You have defined attribute <code>tabindex</code> but the value <code>a</code> is not a valid integer. 2. The element <code>svg</code> does not have an accessible description. Use one of the following solutions to describe element purpose: <code>&lt;title&gt;, &lt;desc&gt;, &lt;text&gt;, aria-label, aria-labelledby, aria-describedby, aria-roledescription</code>. For decorative purpose add an attribute <code>role="presentation"</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('svg');
      expect(Validator.getReport('report_0').ruleId).toBe('accessible-svg');
    });

    it('should return no reports for svg when element is hidden for AT using aria-hidden="true"', () => {
      fakeDom.innerHTML = '<div ><svg version="1.1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg></div>';

      const nodes = DomUtility.querySelectorAllExclude('svg', fakeDom) as SVGElement[];

      new AccessibleSvg().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports for svg when element is hidden for AT using aria-hidden="true" on the parent element', () => {
      fakeDom.innerHTML = '<div aria-hidden="true"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg></div>';

      const nodes = DomUtility.querySelectorAllExclude('svg', fakeDom) as SVGElement[];

      new AccessibleSvg().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });

});
