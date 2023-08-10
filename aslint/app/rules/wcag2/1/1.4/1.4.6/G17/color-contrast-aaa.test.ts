import { ColorContrastA3 } from './color-contrast-aaa';
import { DomUtility } from '../../../../../../utils/dom';
import { Validator } from '../../../../../../validator';
import { $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';
import { Config } from '../../../../../../config';
import { $runnerSettings } from '../../../../../../constants/aslint';

const config = Config.getInstance();

config.init();

describe('Rules', () => {

  describe('ColorContrastA3#', () => {

    let fakeDom;
    const testSelector = '#test';

    new ColorContrastA3().registerValidator();

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

    it('should not pass contrast ratio at least 7:1 for text less than 18pt, not bold (small font)', () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '15pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');

      const ratio = getRatio(Validator.getReport('report_0').message);

      expect(ratio >= 7).toBeFalsy();
    });

    it('should not pass contrast ratio at least 7:1 for text less than 14pt, bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '13pt',
        fontWeight = 'bold';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);

      const ratio = getRatio(Validator.getReport('report_0').message);

      expect(ratio >= 7).toBeFalsy();
    });

    it('should not pass contrast ratio at least 4:5 for text at least 18pt, not bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '18pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');

      const ratio = getRatio(Validator.getReport('report_0').message);

      expect(ratio >= 4.5).toBeFalsy();
    });

    it('should not pass contrast ratio at least 4.5:1 for text at least 40px (~30pt), not bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '40px',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

    it('should not pass contrast ratio at least 4.5:1 for text at least 14pt, bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '14pt',
        fontWeight = 'bold';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

    it('should pass contrast ratio at least 7:1 for text less than 18pt, not bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#333',
        fontSize = '15pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should pass contrast ratio (but return skipped element report) when background is set explicitly throughout parent elements hierarchy', () => {
      const backgroundColor = 'white',
        foregroundColor = 'black',
        fontSize = '15pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<div id="wrapper"><p id="test">Test</p></div>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const wrapper = document.getElementById('wrapper');

      wrapper.style.cssText = `background-color: ${backgroundColor};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
    });

    it('should pass contrast ratio at least 7:1 for text less than 14pt, bold', () => {
      const backgroundColor = 'white',
        foregroundColor = '#333',
        fontSize = '13pt',
        fontWeight = 'bold';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    describe('small text (14pt bold)', () => {
      let node: HTMLElement;
      let baseCss: string;

      beforeEach(() => {
        const fontSize = '14pt',
          fontWeight = 'bold';

        baseCss = `font-size: ${fontSize}; font-weight: ${fontWeight};`;
        fakeDom.innerHTML = `<p class="tmpClass" id="test">Test</p>`;
        node = fakeDom.querySelector(testSelector);
      });

      it('should pass contrast ratio at least 7:1 for small text (14pt bold)', () => {
        node.style.cssText = `${baseCss}background: white; color: #333;`;
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should not pass with contrast ratio less than 7:1 for small text (14pt bold)', () => {
        node.style.cssText = `${baseCss}background: white; color: whitesmoke;`;
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
      });
    });

    it('should not pass if contrast ratio of small font is less than 7', () => {
      const backgroundColor = 'white',
        foregroundColor = '#4b5d5b',
        fontSize = '15pt',
        fontWeight = 'normal';

      fakeDom.innerHTML = '<p id="test">Test</p>';
      const node = fakeDom.querySelector(testSelector);

      node.style.cssText = `background: ${backgroundColor}; color: ${foregroundColor}; font-size: ${fontSize}; font-weight: ${fontWeight};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

    it('should not pass with foreground color #dbdbdb on background color #eaeaea', () => {
      fakeDom.innerHTML = '<div id="wrapper"><p id="test">Test</p></div>';

      const wrapper: HTMLDivElement = document.querySelector('#wrapper');
      const p: HTMLElement = document.querySelector('#test');

      document.body.style.cssText = 'background-color: transparent; color: #dbdbdb;';
      wrapper.style.cssText = 'background-color: #eaeaea;';
      p.style.cssText = 'background-color: transparent; color: #dbdbdb; font-size: 5px;';

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected color contrast ratio for small font size at least 7:1, but got ratio: 1.15:1, <code>background-color: #eaeaea</code>, <code>foreground-color: #dbdbdb</code>, <code>font-size: 4pt</code> (original: <code>5px</code>), <code>font-weight: </code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
    });

    it('should not pass with foreground color #dbdbdb on background color white', () => {
      fakeDom.innerHTML = '<div id="wrapper"><p id="test">Test</p></div>';

      const styles: Partial<CSSStyleDeclaration> = {
        backgroundColor: 'transparent',
        color: '#dbdbdb',
        fontSize: '5px',
        fontWeight: 'normal'
      };
      const node: HTMLElement = document.getElementById('test');

      node.style.cssText = `color: ${styles.color}; font-size: ${styles.fontSize}; background-color: ${styles.backgroundColor};`;

      const wrapperStyles: Partial<CSSStyleDeclaration> = {
        backgroundColor: 'white'
      };
      const wrapper: HTMLElement = document.getElementById('wrapper');

      wrapper.style.cssText = `background-color: ${wrapperStyles.backgroundColor};`;

      const bodyStyles: Partial<CSSStyleDeclaration> = {
        backgroundColor: 'transparent',
        color: '#dbdbdb'
      };
      const body: HTMLElement = document.body;

      body.style.cssText = `color: ${bodyStyles.color}; background-color: ${bodyStyles.backgroundColor};`;

      const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

      new ColorContrastA3().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected color contrast ratio for small font size at least 7:1, but got ratio: 1.38:1, <code>background-color: #ffffff</code>, <code>foreground-color: #dbdbdb</code>, <code>font-size: 4pt</code> (original: <code>5px</code>), <code>font-weight: </code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
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
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        const originalIncludeHidden = config.get($runnerSettings.includeHidden);

        config.set($runnerSettings.includeHidden, false);

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');

        config.set($runnerSettings.includeHidden, originalIncludeHidden);
      });

      it('should skip and not return report for hidden element (display: hidden)', () => {
        node.style.cssText = `${baseCss}display: hidden;`;
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report (position is off screen)', () => {
        node.style.cssText = `${baseCss}margin: -1000px;`;
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip for element with semi-transparent bg color (background: rgba(0,0,0,0.5))', () => {
        node.style.cssText = `${baseCss}background: rgba(0,0,0,0.5);`;
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
      });

      it('should skip for element with transparent bg color (background: rgba(0,0,0,0))', () => {
        node.style.cssText = `${baseCss}background: rgba(0,0,0,0.001);`; // 0.001 because zero alphas are dropping whole background definition in jsdom
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
      });

      it('should skip for element with image background', () => {
        node.style.cssText = `${baseCss}background-image: url("test_image.png");`;
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
      });

      it('should skip for element position = \'sticky\'', () => {
        node.style.cssText = `${baseCss}position: sticky;`;
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
      });

      it('should skip for element position = \'fixed\'', () => {
        node.style.cssText = `${baseCss}position: sticky;`;
        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
      });

      it('should skip for nested element with image background', () => {
        const imageBlockId: string = 'imageBlock';

        fakeDom.innerHTML = `<div id="${imageBlockId}"><div class="b"><div class="a"><p id="test">Test</p></div></div></div>`;

        node = fakeDom.querySelector(testSelector);

        fakeDom.querySelector(`#${imageBlockId}`).style.cssText = 'background-image: url("test_image.png");';

        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
      });

      it('should skip for nested element background color === foreground color', () => {
        fakeDom.innerHTML = `<p id="test">Test</p>`;

        fakeDom.querySelector(testSelector).style.cssText = 'background-color: #ffffff; color: #ffffff';

        const nodes = DomUtility.querySelectorAllExclude(testSelector, fakeDom) as HTMLElement[];

        new ColorContrastA3().validate(nodes);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-aaa');
      });
    });
  });
});
