import { LabelDuplicatedContentTitle } from './label-duplicated-content-title';
import { Validator } from '../../../validator';
import { DomUtility } from '../../../utils/dom';

describe('Rules', () => {

  describe('LabelDuplicatedContentTitle', () => {

    let fakeDom;

    new LabelDuplicatedContentTitle().registerValidator();

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
      fakeDom.innerHTML = '<label title="main">main</label>';
      const nodes = DomUtility.querySelectorAllExclude('[title=main]', fakeDom) as HTMLElement[];

      new LabelDuplicatedContentTitle().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This element has the same content as its <code>title</code> attribute. Consider removing <code>title</code> as some screen readers read both.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-duplicated-content-title');
    });

    it('should return no reports in case of a element with href attribute', () => {
      fakeDom.innerHTML = '<label title="main">main1</label>';
      const nodes = DomUtility.querySelectorAllExclude('[title=main]', fakeDom) as HTMLElement[];

      new LabelDuplicatedContentTitle().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
