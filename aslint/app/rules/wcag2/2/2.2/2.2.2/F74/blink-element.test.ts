import { BlinkElement } from './blink-element';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';
import { $runnerSettings } from '../../../../../../constants/aslint';
import { Config } from '../../../../../../config';

const config = Config.getInstance();

config.init();

describe('Rules', () => {

  describe('BlinkElement#', () => {

    let fakeDom;
    const selector = 'blink';

    new BlinkElement().registerValidator();

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

    it('should return 1 report when there is blink element', () => {
      fakeDom.innerHTML = '<p>My Great Product <blink>Sale! $44,995!</blink></p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new BlinkElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have used the HTML <code>&lt;blink&gt;</code> element which makes the content difficult to read.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('blink');
      expect(Validator.getReport('report_0').ruleId).toBe('blink-element');
    });

    it('should return 1 report when there is style="display: none" for parent blink element and option "includeHidden" is set to true', () => {
      fakeDom.innerHTML = '<div style="display: none"><p>My Great Product <blink>Sale! $44,995!</blink></p></div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new BlinkElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have used <code>&lt;blink&gt;</code> element which makes the content difficult to read. However, it\'s invisible and that state might be temporary.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('blink');
      expect(Validator.getReport('report_0').ruleId).toBe('blink-element');
    });

    it('should return 1 report with skip reason when there is style="display: none" for parent blink element and option "includeHidden" is set to false', () => {
      fakeDom.innerHTML = '<div style="display: none">My Great Product <blink>Sale! $44,995!</blink></div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      const originalIncludeHidden = config.get($runnerSettings.includeHidden);

      config.set($runnerSettings.includeHidden, false);

      new BlinkElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Element was excluded from scanning because the option includeHidden is set to false.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('blink');
      expect(Validator.getReport('report_0').ruleId).toBe('blink-element');
      expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);

      config.set($runnerSettings.includeHidden, originalIncludeHidden);
    });

    it('should return 1 report when there is style="visibility: hidden" for blink element and option "includeHidden" is set to true', () => {
      fakeDom.innerHTML = '<div style="visibility: hidden">My Great Product <blink>Sale! $44,995!</blink></div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new BlinkElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);

      expect(Validator.getReport('report_0').message).toBe('You have used <code>&lt;blink&gt;</code> element which makes the content difficult to read. However, it\'s invisible and that state might be temporary.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('blink');
      expect(Validator.getReport('report_0').ruleId).toBe('blink-element');
    });

    it('should return 1 report with skip reason when there is style="visibility: hidden" for blink element and option "includeHidden" is set to false', () => {
      fakeDom.innerHTML = '<div style="visibility: hidden">My Great Product <blink>Sale! $44,995!</blink></div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      const originalIncludeHidden = config.get($runnerSettings.includeHidden);

      config.set($runnerSettings.includeHidden, false);

      new BlinkElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);

      expect(Validator.getReport('report_0').message).toBe('Element was excluded from scanning because the option includeHidden is set to false.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('blink');
      expect(Validator.getReport('report_0').ruleId).toBe('blink-element');
      expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);

      config.set($runnerSettings.includeHidden, originalIncludeHidden);
    });

    it('should return no reports when there is no blink element', () => {
      fakeDom.innerHTML = '<p>My Great Product Sale! $44,995!</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new BlinkElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
