import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { IncorrectLabelPlacement } from './incorrect-label-placement';

describe('Rules', () => {

  describe('IncorrectLabelPlacement', () => {

    let fakeDom;
    let ruleInstance: IncorrectLabelPlacement;

    new IncorrectLabelPlacement().registerValidator();

    beforeEach(() => {
      ruleInstance = new IncorrectLabelPlacement();
      fakeDom = document.createElement('div');
      fakeDom.id = 'fakedom';
      document.body.appendChild(fakeDom);

      Validator.reset();
    });

    afterEach(() => {
      DomUtility.remove(document.getElementById('fakedom'));
      fakeDom = undefined;
    });

    it('should not fill the report for correctly placed label (checkbox input)', () => {
      fakeDom.innerHTML = `<div>
        <input id="checkbox1" type="checkbox" name="confirm">
        <label for="checkbox1">Label here</label>
        <p>text after label</p>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should fill the reports for incorrectly placed label (radio input)', () => {
      fakeDom.innerHTML = `<div>
        <label for="radio2">Label here</label>
        <input id="radio2" type="radio" name="">
        <p>text after label</p>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

    it('should fill 2 reports for incorrectly placed labels (radio input)', () => {
      fakeDom.innerHTML = `<div>
        <label for="radio2">Label here</label><input id="radio2" type="radio" name="">
        <label for="radio1">Label here</label><input id="radio1" type="radio" name="">
        <p>text after label</p>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
    });

    it('should not fill the report when checkbox is inside the label', () => {
      fakeDom.innerHTML = '<label for="checkbox2">Label here<input id="checkbox2" type="checkbox" name="confirm"></label>';

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should not fill the report when input & label are on a different depth levels', () => {
      fakeDom.innerHTML = `<div>
        <input id="checkbox2" type="checkbox" name="confirm">
        <div>
          <label for="checkbox2">Label here</label>
        </div>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should not fill the report when input & label are on a different depth levels', () => {
      fakeDom.innerHTML = `<div>
       <input id="radio" type="radio" name="confirm">
        <div>
          <label for="radio">Label here</label>
        </div>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should fill the report when there\'s a text between input and label', () => {
      fakeDom.innerHTML = `<div>
        <input id="checkbox2" type="checkbox" name="confirm">
        <div>
          <p>some text</p>
          <label for="checkbox2">Label here</label>
        </div>
        <p>some text here too</p>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

    it('should fill the report when input & label are in reverse order and on a different depth levels', () => {
      fakeDom.innerHTML = `<div>
        <label for="checkbox2">Label here</label>
        <div>
          <input id="checkbox2" type="checkbox" name="confirm">
        </div>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
    });

    it('should fill the report when input & label are in reverse order and on a different depth levels (#2)', () => {
      fakeDom.innerHTML = `<div>
        <div>
          <label for="checkbox2">Label here</label>
        </div>
        <div>
          <input id="checkbox2" type="checkbox" name="confirm">
        </div>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
    });

    it('should fill the report when input & label are in reverse order and on a different depth levels (#3)', () => {
      fakeDom.innerHTML = `<div>
        <div>
          <div>
            <label for="checkbox2">Label here</label>
          </div>
        </div>
        <div>
          <input id="checkbox2" type="checkbox" name="confirm">
        </div>
      </div>`;

      ruleInstance.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
    });
  });
});
