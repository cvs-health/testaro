import { FieldsetNoLegend } from './fieldset-no-legend';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('FieldsetNoLegend#', () => {

    let fakeDom;
    const selector = 'fieldset > :not(legend)';

    new FieldsetNoLegend().registerValidator();

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

    it('should return 2 reports when there are 2 fieldset without legend', () => {

      fakeDom.innerHTML = '<fieldset><p>This should fail</p></fieldset><fieldset><p>This should fail</p></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLFieldSetElement[];

      new FieldsetNoLegend().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Founded <code>p</code> as the first element inside the <code>&lt;fieldset&gt;</code>, but <code>&lt;legend&gt;</code> element must there, which provides a label or description for the group. Context: <code>&lt;fieldset&gt;&lt;p&gt;This should fail&lt;&#x2F;p&gt;&lt;&#x2F;fieldset&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('fieldset-no-legend');
      expect(Validator.getReport('report_1').message).toBe('Founded <code>p</code> as the first element inside the <code>&lt;fieldset&gt;</code>, but <code>&lt;legend&gt;</code> element must there, which provides a label or description for the group. Context: <code>&lt;fieldset&gt;&lt;p&gt;This should fail&lt;&#x2F;p&gt;&lt;&#x2F;fieldset&gt;</code>');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_1').ruleId).toBe('fieldset-no-legend');
    });

    it('should return 1 report when there is fieldset without legend', () => {

      fakeDom.innerHTML = '<fieldset><p>This should fail</p></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLFieldSetElement[];

      new FieldsetNoLegend().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Founded <code>p</code> as the first element inside the <code>&lt;fieldset&gt;</code>, but <code>&lt;legend&gt;</code> element must there, which provides a label or description for the group. Context: <code>&lt;fieldset&gt;&lt;p&gt;This should fail&lt;&#x2F;p&gt;&lt;&#x2F;fieldset&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('fieldset-no-legend');
    });

    it('should return no report when there is legend in fieldset', () => {

      fakeDom.innerHTML = '<fieldset><legend>This should pass</legend></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLFieldSetElement[];

      new FieldsetNoLegend().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
