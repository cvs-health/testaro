import { DuplicatedForAttribute } from './duplicated-for-attribute';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('DuplicatedForAttribute#', () => {

    let fakeDom;
    const selector = 'label[for]';

    new DuplicatedForAttribute().registerValidator();

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

    it('should return 2 reports when there are 2 duplicated label for', () => {
      fakeDom.innerHTML = '<label for="moose">First label for moose</label><label for="moose1">First label for moose</label><label for="moose">Second label for moose</label><label for="moose1">Second label for moose</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new DuplicatedForAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(4);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>for="moose"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('duplicated-for-attribute');
      expect(Validator.getReport('report_1').message).toBe('Attribute <code>for="moose"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_1').ruleId).toBe('duplicated-for-attribute');
      expect(Validator.getReport('report_2').message).toBe('Attribute <code>for="moose1"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_2').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_2').ruleId).toBe('duplicated-for-attribute');
      expect(Validator.getReport('report_3').message).toBe('Attribute <code>for="moose1"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_3').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_3').ruleId).toBe('duplicated-for-attribute');
    });

    it('should return 1 report when there are 3 duplicated label for', () => {
      fakeDom.innerHTML = '<label for="moose">First label for moose</label><label for="moose">Second label for moose</label><label for="moose">Third label for moose</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new DuplicatedForAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(3);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>for="moose"</code> should be unique. It has been defined 3 times.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('duplicated-for-attribute');
      expect(Validator.getReport('report_1').message).toBe('Attribute <code>for="moose"</code> should be unique. It has been defined 3 times.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_1').ruleId).toBe('duplicated-for-attribute');
      expect(Validator.getReport('report_2').message).toBe('Attribute <code>for="moose"</code> should be unique. It has been defined 3 times.');
      expect(Validator.getReport('report_2').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_2').ruleId).toBe('duplicated-for-attribute');
    });

    it('should return 1 report when there are 2 labels for', () => {
      fakeDom.innerHTML = '<label for="moose">First label for moose</label><label for="moose">Second label for moose</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new DuplicatedForAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>for="moose"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('duplicated-for-attribute');
      expect(Validator.getReport('report_1').message).toBe('Attribute <code>for="moose"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_1').ruleId).toBe('duplicated-for-attribute');
    });

    it('should return no report when there are no duplicated label for', () => {
      fakeDom.innerHTML = '<label for="moose">First label for moose</label><label for="moose1">Second label for moose</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new DuplicatedForAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
