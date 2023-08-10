import { MissingHrefOnA } from './missing-href-on-a';
import { Validator } from '../../../validator';
import { DomUtility } from '../../../utils/dom';

describe('Rules', () => {

  describe('MissingHrefOnA', () => {

    let fakeDom;

    new MissingHrefOnA().registerValidator();

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

    it('should return correct data for a element without href attribute', () => {
      fakeDom.innerHTML = '<a>example.com</a>';
      const nodes = DomUtility.querySelectorAllExclude('a:not([href])', fakeDom) as HTMLAnchorElement[];

      new MissingHrefOnA().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Missing attribute <code>href</code> on link. The user cannot navigate to this element using the keyboard. A better option here is to use a <code>&lt;a&gt;</code> element instead.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-href-on-a');
    });

    it('should return no reports in case of a element with href attribute', () => {
      fakeDom.innerHTML = '<a href="http://example.com">example.com</a>';
      const nodes = DomUtility.querySelectorAllExclude('a:not([href])', fakeDom) as HTMLAnchorElement[];

      new MissingHrefOnA().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
