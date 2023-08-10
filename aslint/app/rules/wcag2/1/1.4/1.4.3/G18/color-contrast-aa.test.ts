import { ColorContrastA2 } from './color-contrast-aa';
import { DomUtility } from '../../../../../../utils/dom';
import { Validator } from '../../../../../../validator';
import { TranslateService } from '../../../../../../services/translate';
import { $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';
import { Config } from '../../../../../../config';
import { $runnerSettings } from '../../../../../../constants/aslint';

const config = Config.getInstance();

config.init();

describe('Rules', () => {

  describe('ColorContrastA2#', () => {

    let fakeDom;
    const testSelector = '#test';

    new ColorContrastA2().registerValidator();

    const getRatio = (message: string): number => {
      return Number((/ratio:\D+(\d+\.?\d*):1/g).exec(message)[1]);
    };

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

    it('should not pass contrast ratio at least 4.5:1 for text less than 18pt, not bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '15pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_aa_report_message_5', ['4.48', '#ffffff', '#777777', fontSize, fontSize, fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');

      const ratio = getRatio(Validator.getReport('report_0').message);

      expect(ratio >= 4.5).toBeFalsy();
    });

    it('should not pass contrast ratio at least 4.5:1 for text less than 14pt, bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '13pt',
        fontWeight = 'bold';

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_aa_report_message_5', ['4.48', '#ffffff', '#777777', fontSize, fontSize, fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');

      const ratio = getRatio(Validator.getReport('report_0').message);

      expect(ratio >= 4.5).toBeFalsy();
    });

    it('should not pass contrast ratio at least 3:1 for text at least 18pt, not bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#999',
        fontSize = '18pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_aa_report_message_4', ['2.85', '#ffffff', '#999999', fontSize, fontSize, fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');

      const ratio = getRatio(Validator.getReport('report_0').message);

      expect(ratio >= 3).toBeFalsy();
    });

    it('should not pass contrast ratio at least 3:1 for text at least 40px (~30pt), not bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#999',
        fontSize = '40px',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_aa_report_message_4', ['2.85', '#ffffff', '#999999', '30pt', fontSize, fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');

      const ratio = getRatio(Validator.getReport('report_0').message);

      expect(ratio >= 3).toBeFalsy();
    });

    it('should not pass contrast ratio at least 3:1 for text at least 13pt, bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#999',
        fontSize = '13pt',
        fontWeight = 'bold';

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_aa_report_message_5', ['2.85', '#ffffff', '#999999', fontSize, fontSize, fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');

      const ratio = getRatio(Validator.getReport('report_0').message);

      expect(ratio >= 3).toBeFalsy();
    });

    it('should pass contrast ratio (but return skipped element report) when background is set explicitly throughout parent elements hierarchy', () => {
      const backgroundColor = 'white',
        foregroundColor = 'black',
        fontSize = '15pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<div id="wrapper"><p id="test">Test</p></div>';

      const node = document.getElementById('test');

      node.style.cssText = `color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const wrapper = document.getElementById('wrapper');

      wrapper.style.cssText = `background-color: ${backgroundColor};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');
    });

    it('should pass contrast ratio at least 4.5:1 for text less than 18pt, not bold (small font)', () => {
      const backgroundColor = 'white',
        foregroundColor = '#747474',
        fontSize = '15pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should pass contrast ratio at least 4.5:1 for text less than 14pt, bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#747474',
        fontSize = '13pt',
        fontWeight = 'bold';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should pass contrast ratio at least 3:1 for text at least 18pt, not bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#747474',
        fontSize = '18pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should pass contrast ratio at least 3:1 for text at least 14pt, bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#747474',
        fontSize = '14pt',
        fontWeight = 'bold';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = document.getElementById('test');

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should not pass with small (5px) white font (#dbdbdb) on white background', () => {
      fakeDom.innerHTML = '<div id="wrapper"><p id="test">Test</p></div>';

      const bodyColor = '#dbdbdb',
        wrapperBackgroundColor = 'white',
        color = '#dbdbdb',
        fontSize = '5px';

      const node: HTMLElement = document.getElementById('test');

      node.style.cssText = `color: ${color}; font-size: ${fontSize}; background-color: transparent;`;

      const wrapper: HTMLElement = document.getElementById('wrapper');

      wrapper.style.cssText = `background-color: ${wrapperBackgroundColor};`;

      const body: HTMLElement = document.body;

      body.style.cssText = `color: ${bodyColor}; background-color: transparent;`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA2().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected color contrast ratio for small font size at least 4.5:1, but got ratio: 1.38:1, <code>background-color: #ffffff</code>, <code>foreground-color: #dbdbdb</code>, <code>font-size: 4pt</code> (original: <code>5px</code>), <code>font-weight: </code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');
    });

    describe('skipping conditions', () => {
      let node: HTMLElement;
      let baseCss: string;

      beforeEach(() => {
        const backgroundColor = 'white',
          foregroundColor = '#333',
          fontSize = '12pt',
          fontWeight = 'bold';

        baseCss = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

        fakeDom.innerHTML = `<p id="test">Test</p>`;
        node = fakeDom.querySelector(testSelector);
      });

      it('should skip for hidden element (visibility: hidden) when the runner option includeHidden is set to false', () => {
        node.style.cssText = `${baseCss}visibility: hidden;`;

        const originalIncludeHidden = config.get($runnerSettings.includeHidden);

        config.set($runnerSettings.includeHidden, false);

        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');

        config.set($runnerSettings.includeHidden, originalIncludeHidden);
      });

      it('should skip and not return report for hidden element (display: hidden) when the runner option includeHidden is set to false', () => {
        node.style.cssText = `${baseCss}display: hidden;`;

        const originalIncludeHidden = config.get($runnerSettings.includeHidden);

        config.set($runnerSettings.includeHidden, false);

        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(0);

        config.set($runnerSettings.includeHidden, originalIncludeHidden);
      });

      it('should skip and not return report when position is off screen', () => {
        node.style.cssText = `${baseCss}margin: -1000px;`;
        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip for element with semi-transparent bg color (background: rgba(0,0,0,0.5))', () => {
        node.style.cssText = `${baseCss}background: rgba(0,0,0,0.5);`;
        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');
      });

      it('should skip for element with transparent bg color (opacity: 0)', () => {
        node.style.cssText = `${baseCss}opacity: 0;`;
        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');
      });

      it('should skip for element with image background', () => {
        node.style.cssText = `${baseCss}background-image: url("test_image.png");`;
        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');
      });

      it('should skip for nested element with image background', () => {
        const imageBlockId: string = 'imageBlock';

        fakeDom.innerHTML = `<div id="${imageBlockId}"><div class="b"><div class="a"><p id="test">Test</p></div></div></div>`;

        node = fakeDom.querySelector(testSelector);

        fakeDom.querySelector(`#${imageBlockId}`).style.cssText = 'background-image: url("test_image.png");';

        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');
      });

      it('should skip for nested element background color === foreground color', () => {
        fakeDom.innerHTML = `<p id="test" style="background-color: #ffffff; color: #ffffff;">Test</p>`;

        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');
      });

      it('should skip for element position = \'sticky\' when includeHidden runner option is set to false', () => {
        node.style.cssText = `${baseCss}position: sticky;`;

        const originalIncludeHidden = config.get($runnerSettings.includeHidden);

        config.set($runnerSettings.includeHidden, false);

        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');

        config.set($runnerSettings.includeHidden, originalIncludeHidden);
      });

      it('should skip for element position = \'fixed\' when includeHidden runner option is set to false', () => {
        node.style.cssText = `${baseCss}position: fixed;`;

        const originalIncludeHidden = config.get($runnerSettings.includeHidden);

        config.set($runnerSettings.includeHidden, false);

        new ColorContrastA2().validate(DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[]);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aa');

        config.set($runnerSettings.includeHidden, originalIncludeHidden);
      });

    });

  });

});
