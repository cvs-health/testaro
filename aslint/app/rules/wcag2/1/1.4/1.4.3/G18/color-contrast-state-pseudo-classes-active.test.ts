import { DomUtility } from '../../../../../../utils/dom';
import { Validator } from '../../../../../../validator';
import { TranslateService } from '../../../../../../services/translate';
import { ColorContrastStatePseudoClassesActive } from './color-contrast-state-pseudo-classes-active';
import { CommonUtility } from '../../../../../../utils/common';
import { ColorContrastPseudoClassesTestHelper } from './color-contrast-pseudo-classes-test.helper';
import { ColorContrastStatePseudoClassesHover } from './color-contrast-state-pseudo-classes-hover';

describe('Rules', () => {

  describe('ColorContrastStatePseudoClassesActive#', () => {

    let fakeDom: Element;

    new ColorContrastStatePseudoClassesActive().registerValidator();

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_4', ['active', '4.48', '#ffffff', '#777777', '15', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-active');

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_4', ['active', '4.48', '#ffffff', '#777777', '13', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-active');

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_3', ['active', '2.85', '#ffffff', '#999999', '18', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-active');

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_3', ['active', '2.85', '#ffffff', '#999999', '30', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-active');

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('color_contrast_state_pseudo_classes_report_message_4', ['active', '2.85', '#ffffff', '#999999', '13', fontWeight, '']));
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('color-contrast-state-pseudo-classes-active');

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
        #test:active {
          color: ${foregroundColor};
        }
        #wrapper {
          background: #fff;
        }
        #wrapper:active {
          background: ${backgroundColor};
        }
      `);

      fakeDom.innerHTML = '<button id="wrapper"><a id="test">Test</a></button>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

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
        #test:active {
          background: ${backgroundColor};
          color: ${foregroundColor};
        }
      `);

      fakeDom.innerHTML = '<a id="test">Test</a>';

      const rule: ColorContrastStatePseudoClassesActive = new ColorContrastStatePseudoClassesActive();

      await rule.run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    describe('skipping conditions', () => {

      let testElementId: string;

      beforeEach(() => {
        testElementId = `test_${CommonUtility.randomRange()}`;
      });

      it('should skip and not return report for hidden element (visibility: hidden)', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'visibility: hidden;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report (position is off screen)', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'margin: -1000px;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report for element with semi-transparent bg color (background: rgba(0,0,0,0.5))', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'background: rgba(0,0,0,0.5);', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report for element with transparent bg color (opacity: 0)', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'opacity: 0;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report for element with image background', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'background-image: url("test_image.png");', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report for element position = \'sticky\'', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'position: sticky;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report for element position = \'fixed\'', async () => {
        ColorContrastPseudoClassesTestHelper.fillInnerHtml(fakeDom, 'position: fixed;', testElementId);
        const rule: ColorContrastStatePseudoClassesHover = new ColorContrastStatePseudoClassesHover();

        await rule.run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report for nested element with image background', async () => {
        const imageBlockId: string = 'imageBlock';

        fakeDom.innerHTML = `<div id="${imageBlockId}"><div class="b"><div class="a"><p id="test">Test</p></div></div></div>`;

        const imageBlock: any = fakeDom.querySelector(`#${imageBlockId}`);

        imageBlock.style.cssText = 'background-image: url("test_image.png");';

        await new ColorContrastStatePseudoClassesHover().run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });

      it('should skip and not return report for nested element background color === foreground color', async () => {

        fakeDom.innerHTML = `<p id="test">Test</p>`;

        const testElement: any = fakeDom.querySelector('#test');

        testElement.style.cssText = 'background-color: #ffffff; color: #ffffff';

        await new ColorContrastStatePseudoClassesHover().run(fakeDom);

        expect(Object.keys(Validator.getReports()).length).toBe(0);
      });
    });

  });

});
