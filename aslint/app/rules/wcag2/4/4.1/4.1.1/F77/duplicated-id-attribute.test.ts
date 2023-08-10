import { DuplicatedIdAttribute } from './duplicated-id-attribute';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('DuplicatedIdAttribute#', () => {

    let fakeDom;
    const selector = '[id]';

    new DuplicatedIdAttribute().registerValidator();

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

    it('should return no reports when duplicated ids are the same, but the difference is in using space', () => {
      const zeroWidthSpace: string = String.fromCharCode(8203);

      fakeDom.innerHTML = `<div id="test">1</div><div id="test${zeroWidthSpace}">2</div>`;

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new DuplicatedIdAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return one report when there are duplicated ids on <div> and <div>', () => {
      fakeDom.innerHTML = '<div id="test">1</div><div id="test">2</div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new DuplicatedIdAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>id="test"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_0').ruleId).toBe('duplicated-id-attribute');
      expect(Validator.getReport('report_1').message).toBe('Attribute <code>id="test"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_1').ruleId).toBe('duplicated-id-attribute');
    });

    it('should return one report when there are duplicated ids on <label> and <span>', () => {
      fakeDom.innerHTML = '<label id="test">1</label><span id="test">2</span>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new DuplicatedIdAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>id="test"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('duplicated-id-attribute');
      expect(Validator.getReport('report_1').message).toBe('Attribute <code>id="test"</code> should be unique. It has been defined 2 times.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('span');
      expect(Validator.getReport('report_1').ruleId).toBe('duplicated-id-attribute');
    });

    it('should return one report when there are duplicated ids on <label> and <span> and <div>', () => {
      fakeDom.innerHTML = '<label id="test">1</label><span id="test">2</span><div id="test">22</div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new DuplicatedIdAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(3);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>id="test"</code> should be unique. It has been defined 3 times.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('duplicated-id-attribute');
      expect(Validator.getReport('report_1').message).toBe('Attribute <code>id="test"</code> should be unique. It has been defined 3 times.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('span');
      expect(Validator.getReport('report_1').ruleId).toBe('duplicated-id-attribute');
      expect(Validator.getReport('report_2').message).toBe('Attribute <code>id="test"</code> should be unique. It has been defined 3 times.');
      expect(Validator.getReport('report_2').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_2').ruleId).toBe('duplicated-id-attribute');
    });

    it('should return no reports when there are no duplicated ids', () => {
      fakeDom.innerHTML = '<div id="main1">1</div><label id="main">2</label>';
      const nodes = DomUtility.querySelectorAllExclude('[id]', fakeDom);

      new DuplicatedIdAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there are ids with an empty value', () => {
      fakeDom.innerHTML = '<div id="">1</div><label id="">2</label>';
      const nodes = DomUtility.querySelectorAllExclude('[id]', fakeDom);

      new DuplicatedIdAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there are ids with value that contains a space character', () => {
      fakeDom.innerHTML = '<div id="this is">1</div><label id="invalid value">2</label>';
      const nodes = DomUtility.querySelectorAllExclude('[id]', fakeDom);

      new DuplicatedIdAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
