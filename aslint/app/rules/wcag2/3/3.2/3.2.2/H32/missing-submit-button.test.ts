import { MissingSubmitButton } from './missing-submit-button';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { TranslateService } from '../../../../../../services/translate';

describe('Rules', () => {

  describe('MissingSubmitButton#', () => {

    let fakeDom;
    const selector = 'form';

    new MissingSubmitButton().registerValidator();

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

    it('should return one report when form does not have children', () => {
      fakeDom.innerHTML = '<form>Empty form</form>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MissingSubmitButton().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('missing_submit_button_report_message_1'));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('form');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-submit-button');
    });

    it('should return one report when form has input type="hidden"', () => {

      fakeDom.innerHTML = '<form method="POST" id="foo"><input type="text" id="username"/><input type="password" id="pass"/><input type="hidden"/></form>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MissingSubmitButton().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('missing_submit_button_report_message_2', ['input type&#x3D;&quot;hidden&quot;']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('form');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-submit-button');
    });

    it('should return one report when input does not exist', () => {
      fakeDom.innerHTML = '<form method="POST" id="foo"><input type="text" id="username"/><input type="password" id="pass"/></form>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MissingSubmitButton().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('missing_submit_button_report_message_3'));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('form');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-submit-button');
    });

    it('should return no reports when there is input[type="submit"]', () => {
      fakeDom.innerHTML = '<form method="POST" id="foo"><input type="text" id="username"/><input type="password" id="pass"/><input type="submit"/></form>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MissingSubmitButton().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is input[type="image"]', () => {
      fakeDom.innerHTML = '<form method="POST" id="foo"><input type="text" id="username"/><input type="password" id="pass"/><input type="image"/></form>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MissingSubmitButton().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is button[type="submit"]', () => {
      fakeDom.innerHTML = '<form method="POST" id="foo"><input type="text" id="username"/><input type="password" id="pass"/><button type="submit"/></form>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MissingSubmitButton().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
