import { GroupElementsNameAttribute } from './group-elements-name-attribute';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('GroupElementsNameAttribute#', () => {

    let fakeDom;
    const selector = 'input[name]:not([type="hidden"]):not([aria-hidden="true"])';

    new GroupElementsNameAttribute().registerValidator();

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

    it('should return 1 report when there are 3 inputs with same name', () => {

      fakeDom.innerHTML = '<input name="test" type="text">Org</input>' +
        '<input name="test" type="text">Username</input><br/><input name="test" type="password">Password</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

      new GroupElementsNameAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(3);
      expect(Validator.getReport('report_0').message).toBe('Ensure all related checkboxes are grouped together.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('group-elements-name-attribute');
      expect(Validator.getReport('report_1').message).toBe('Ensure all related checkboxes are grouped together.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_1').ruleId).toBe('group-elements-name-attribute');
      expect(Validator.getReport('report_2').message).toBe('Ensure all related checkboxes are grouped together.');
      expect(Validator.getReport('report_2').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_2').ruleId).toBe('group-elements-name-attribute');
    });

    it('should return 1 report when there are 2 inputs with same name but without group', () => {
      fakeDom.innerHTML = '<input name="test" type="text">Username</input><br/><input name="test" type="password">Password</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

      new GroupElementsNameAttribute().validate(nodes);
      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Ensure all related checkboxes are grouped together.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('group-elements-name-attribute');
      expect(Validator.getReport('report_1').message).toBe('Ensure all related checkboxes are grouped together.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_1').ruleId).toBe('group-elements-name-attribute');
    });

    it('should return no report when there are 2 inputs with same name but inside fieldset', () => {
      fakeDom.innerHTML = '<fieldset><input name="test" type="text">Username</input><br/><input name="test" type="password">Password</input></fieldset>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

      new GroupElementsNameAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there are when there are 2 inputs with same name but 2nd is hidden', () => {
      fakeDom.innerHTML = '<input name="test" type="text">Username</input><br/><input name="test" type="hidden">Password</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

      new GroupElementsNameAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there are when there are 2 inputs with same name but 2nd has aria-hidden="true"', () => {
      fakeDom.innerHTML = '<input name="test" type="text">Username</input><br/><input name="test" type="password" aria-hidden="true">Password</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

      new GroupElementsNameAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
