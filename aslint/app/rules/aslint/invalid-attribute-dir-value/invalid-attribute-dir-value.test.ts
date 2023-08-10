import { InvalidAttributeDirValue } from './invalid-attribute-dir-value';
import { Validator } from '../../../validator';
import { DomUtility } from '../../../utils/dom';

describe('Rules', () => {

  describe('InvalidAttributeDirValue', () => {

    it('should indicate that class exists', () => {
      expect(InvalidAttributeDirValue).toBeDefined();
    });

    let fakeDom;

    new InvalidAttributeDirValue().registerValidator();

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

    it('should return correct data for dir with wrong attribute value', () => {
      fakeDom.innerHTML = '<p dir="wrong">Wrong attribute</p>';
      const nodes = DomUtility.querySelectorAllExclude('[dir]:not([dir="rtl"]):not([dir="ltr"]):not([dir="auto"])', fakeDom) as HTMLElement[];

      new InvalidAttributeDirValue().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>dir</code> has invalid value <code>wrong</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('invalid-attribute-dir-value');
    });

    it('should return correct data for dir with empty attribute value', () => {
      fakeDom.innerHTML = '<p dir>Wrong attribute</p>';
      const nodes = DomUtility.querySelectorAllExclude('[dir]:not([dir="rtl"]):not([dir="ltr"]):not([dir="auto"])', fakeDom) as HTMLElement[];

      new InvalidAttributeDirValue().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>dir</code> has invalid value <code></code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('invalid-attribute-dir-value');
    });

    it('should return no reports in case of dir is ltr', () => {
      fakeDom.innerHTML = '<p dir="ltr">Left to right(English)</p>';
      const nodes = DomUtility.querySelectorAllExclude('[dir]:not([dir="rtl"]):not([dir="ltr"]):not([dir="auto"])', fakeDom) as HTMLElement[];

      new InvalidAttributeDirValue().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports in case of dir is rtl', () => {
      fakeDom.innerHTML = '<p dir="rtl">Right to left(Arabic)</p>';
      const nodes = DomUtility.querySelectorAllExclude('[dir]:not([dir="rtl"]):not([dir="ltr"]):not([dir="auto"])', fakeDom) as HTMLElement[];

      new InvalidAttributeDirValue().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports in case of dir is auto', () => {
      fakeDom.innerHTML = '<p dir="auto">Auto</p>';
      const nodes = DomUtility.querySelectorAllExclude('[dir]:not([dir="rtl"]):not([dir="ltr"]):not([dir="auto"])', fakeDom) as HTMLElement[];

      new InvalidAttributeDirValue().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
