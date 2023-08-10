import { SelectInitialOption } from './select-initial-option';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('SelectInitialOption', () => {

    let fakeDom;
    const selector = 'select';

    new SelectInitialOption().registerValidator();

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

    it('should return one report when there is no option with selected attribute', () => {
      fakeDom.innerHTML = '<select><option value="value1">1</option><option value="value2">2</option></select>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLSelectElement[];

      new SelectInitialOption().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Missing default selection <code>&lt;option&gt;</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('select');
      expect(Validator.getReport('report_0').ruleId).toBe('select-initial-option');
    });

    it('should return no reports when there is select with selected option', () => {
      fakeDom.innerHTML = '<select><option selected value="value1">1</option><option value="value2">2</option></select>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLSelectElement[];

      new SelectInitialOption().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is no select', () => {
      fakeDom.innerHTML = '<div><option selected value="value1">1</option><option value="value2">2</option></div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLSelectElement[];

      new SelectInitialOption().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
