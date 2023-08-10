import { DomUtility } from '../../../../../../utils/dom';
import { Validator } from '../../../../../../validator';
import { TranslateService } from '../../../../../../services/translate';
import { ColorContrastStatePseudoClassesHover } from './color-contrast-state-pseudo-classes-hover';
import { ColorContrastPseudoClassesTestHelper } from './color-contrast-pseudo-classes-test.helper';
import { CommonUtility } from '../../../../../../utils/common';
import { $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';
import { Config } from '../../../../../../config';
import { $runnerSettings } from '../../../../../../constants/aslint';

const RED_DOT_IMG = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const config = Config.getInstance();

config.init();

describe('Rules', () => {

  describe('ColorContrastStatePseudoClassesHover#', () => {

    let fakeDom: Element;

    new ColorContrastStatePseudoClassesHover().registerValidator();

    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => { });

      fakeDom = document.createElement('div');
      fakeDom.id = 'fakedom';
      document.body.appendChild(fakeDom);

      Validator.reset();
    });

    afterEach(() => {
      DomUtility.remove(document.getElementById('fakedom'));
      fakeDom = undefined;

      (console.warn as any).mockReset();
    });

    it('should not pass contrast ratio at least 4.5:1 for text less than 18pt, not bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '15pt',
        fontWeight = 'normal';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_4', ['hover', '4.48', '#ffffff', '#777777', '15', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

      expect(ColorContrastPseudoClassesTestHelper.getRatio(Validator.getReport('report_0').message) >= 4.5).toBeFalsy();
    });

    it('should not pass contrast ratio at least 4.5:1 for text less than 14pt, bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#777',
        fontSize = '13pt',
        fontWeight = 'bold';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_4', ['hover', '4.48', '#ffffff', '#777777', '13', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

      expect(ColorContrastPseudoClassesTestHelper.getRatio(Validator.getReport('report_0').message) >= 4.5).toBeFalsy();
    });

    it('should not pass contrast ratio at least 3:1 for text at least 18pt, not bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#999',
        fontSize = '18pt',
        fontWeight = 'normal';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_3', ['hover', '2.85', '#ffffff', '#999999', '18', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

      expect(ColorContrastPseudoClassesTestHelper.getRatio(Validator.getReport('report_0').message) >= 3).toBeFalsy();
    });

    it('should not pass contrast ratio at least 3:1 for text at least 40px (~30pt), not bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#999',
        fontSize = '40px',
        fontWeight = 'normal';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_3', ['hover', '2.85', '#ffffff', '#999999', '30', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

      expect(ColorContrastPseudoClassesTestHelper.getRatio(Validator.getReport('report_0').message) >= 3).toBeFalsy();
    });

    it('should not pass contrast ratio at least 3:1 for text at least 13pt, bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#999',
        fontSize = '13pt',
        fontWeight = 'bold';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_4', ['hover', '2.85', '#ffffff', '#999999', '13', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

      expect(ColorContrastPseudoClassesTestHelper.getRatio(Validator.getReport('report_0').message) >= 3).toBeFalsy();
    });

    it('should pass contrast ratio when background is set explicitly throughout parent elements hierarchy', async () => {
      const backgroundColor = 'white',
        foregroundColor = 'black',
        fontSize = '15pt',
        fontWeight = 'normal';

      DomUtility.createCSS(`
        #test {
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          color: ${foregroundColor};
        }
        #wrapper {
          background: #fff;
        }
        #wrapper:hover {
          background: ${backgroundColor};
        }
      `);

      fakeDom.innerHTML = '<div id="wrapper"><p id="test">Test</p></div>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should pass contrast ratio at least 4.5:1 for text less than 18pt, not bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#747474',
        fontSize = '15pt',
        fontWeight = 'normal';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should pass contrast ratio at least 4.5:1 for text less than 14pt, bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#747474',
        fontSize = '13pt',
        fontWeight = 'bold';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should pass contrast ratio at least 3:1 for text at least 18pt, not bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#747474',
        fontSize = '18pt',
        fontWeight = 'normal';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should pass contrast ratio at least 3:1 for text at least 14pt, bold', async () => {
      const backgroundColor = 'white',
        foregroundColor = '#747474',
        fontSize = '14pt',
        fontWeight = 'bold';

      DomUtility.createCSS(`
        #test {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #test:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<p id="test">Test</p>';

      const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    describe('skipping conditions', () => {

      let testElementId: string;

      beforeEach(() => {
        testElementId = `test_${CommonUtility.randomRange()}`;
      });

      it('should skip and return 1 report for hidden element (visibility: hidden) when includeHidden is set to false', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'visibility: hidden;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();
        const originalIncludeHidden = config.get($runnerSettings.includeHidden);

        config.set($runnerSettings.includeHidden, false);

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

        config.set($runnerSettings.includeHidden, originalIncludeHidden);
      });

      it('should skip when position is off screen', async () => {
        jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
          return {
            height: 10,
            left: 0,
            top: -1000,
            width: 10
          } as DOMRect;
        });

        const originalOffsetHeight = Object.getOwnPropertyDescriptor(document.body, 'offsetHeight') || {
          value: 0
        };
        const originalOffsetWidth = Object.getOwnPropertyDescriptor(document.body, 'offsetWidth') || {
          value: 0
        };

        Object.defineProperty(document.body, 'offsetHeight', {
          configurable: true,
          value: 200
        });

        Object.defineProperty(document.body, 'offsetWidth', {
          configurable: true,
          value: 200
        });

        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'top: -1000px;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        const originalIncludeHidden = config.get($runnerSettings.includeHidden);

        config.set($runnerSettings.includeHidden, false);

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

        config.set($runnerSettings.includeHidden, originalIncludeHidden);

        Object.defineProperty(document.body, 'offsetHeight', originalOffsetHeight);
        Object.defineProperty(document.body, 'offsetWidth', originalOffsetWidth);
      });

      it('should skip for the element with semi-transparent bg color (background: rgba(0,0,0,0.5))', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'background: rgba(0,0,0,0.5);', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');
      });

      it('should skip for the element with transparent bg color (opacity: 0)', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'opacity: 0;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');
      });

      it('should skip for the element with image background', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'background-image: url("test_image.png");', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');
      });

      it('should skip for the element position = \'sticky\'', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'position: sticky;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');
      });

      it('should skip for the element position = \'fixed\'', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'position: fixed;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');
      });

      it('should skip for the element with image background', async () => {
        fakeDom.innerHTML = `<div style="background-image: ${RED_DOT_IMG}">Test</div>`;

        const originalIncludeHidden = config.get($runnerSettings.includeHidden);

        config.set($runnerSettings.includeHidden, false);

        await new ColorContrastStatePseudoClassesHover().run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

        config.set($runnerSettings.includeHidden, originalIncludeHidden);
      });

      it('should skip for the element background color === foreground color', async () => {

        fakeDom.innerHTML = `<p id="test" style="background-color: #ffffff; color: #ffffff;">Test</p>`;

        await new ColorContrastStatePseudoClassesHover().run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(1);
        expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);
        expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-hover');

      });
    });

  });

});
