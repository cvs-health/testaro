import { LegendFirstChildOfFieldSet } from './legend-first-child-of-fieldset';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('LegendFirstChildOfFieldSet#', () => {

    let fakeDom;
    const selector = 'fieldset > :first-child';

    new LegendFirstChildOfFieldSet().registerValidator();

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

    it('should return one report when there is no legend in fieldset', () => {
      fakeDom.innerHTML = '<fieldset><input id="m" type="radio"><label for="m">William Shakespeare</label></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LegendFirstChildOfFieldSet().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;legend&gt;</code> to be the first child of the <code>&lt;fieldset&gt;</code> element, but instead there is <code>&lt;input id&#x3D;&quot;m&quot; type&#x3D;&quot;radio&quot;&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('legend-first-child-of-fieldset');
    });

    it('should return one report when legend is not first child in fieldset', () => {
      fakeDom.innerHTML = '<fieldset><div>Sorry, I am first</div><legend>Legend</legend><input id="m" type="radio"><label for="m">William Shakespeare</label></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LegendFirstChildOfFieldSet().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;legend&gt;</code> to be the first child of the <code>&lt;fieldset&gt;</code> element, but instead there is <code>&lt;div&gt;&lt;&#x2F;div&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_0').ruleId).toBe('legend-first-child-of-fieldset');
    });

    it('should return no reports when there is a legend as a first child in fieldset and is not empty', () => {
      fakeDom.innerHTML = '<fieldset><legend>Legend</legend><input id="m" type="radio"><label for="m">William Shakespeare</label></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LegendFirstChildOfFieldSet().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is a legend as first child in fieldset but it\'s empty', () => {
      fakeDom.innerHTML = '<fieldset><legend></legend><input id="m" type="radio"><label for="m">William Shakespeare</label></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LegendFirstChildOfFieldSet().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Element <code>&lt;legend&gt;</code> is the first child of the <code>&lt;fieldset&gt;</code> element, but it contains only white spaces.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('legend');
      expect(Validator.getReport('report_0').ruleId).toBe('legend-first-child-of-fieldset');
    });

    it('should return report when there is legend as first child in fieldset but has only whitespaces', () => {
      fakeDom.innerHTML = '<fieldset><legend>    </legend><input id="m" type="radio"><label for="m">William Shakespeare</label></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LegendFirstChildOfFieldSet().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Element <code>&lt;legend&gt;</code> is the first child of the <code>&lt;fieldset&gt;</code> element, but it contains only white spaces.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('legend');
      expect(Validator.getReport('report_0').ruleId).toBe('legend-first-child-of-fieldset');
    });

  });
});
