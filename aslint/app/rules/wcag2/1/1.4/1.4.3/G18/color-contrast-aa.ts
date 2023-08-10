import { TinyColor, readability, isReadable } from '@ctrl/tinycolor';

import { DomUtility } from '../../../../../../utils/dom';
import { Css } from '../../../../../../utils/css';
import { TextUtility } from '../../../../../../utils/text';
import { $runnerSettings } from '../../../../../../constants/aslint';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity, $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';
import { Config } from '../../../../../../config';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class ColorContrastA2 extends AbstractRule {
  private appConfig: Config = Config.getInstance();

  protected selector: string = `*${[
    ':root',
    'head',
    'body',
    'title',
    'style',
    'script',
    'noscript',
    'meta',
    'link',
    'br',
    'hr',
    'object',
    'path',
    'g',
    'linearGradient',
    'stop',
    'desc',
    'filter',
    'img',
    'input',
    'iframe',
    'code',
    'defs',
    ':empty'
  ].map((i: string): string => {
    return `:not(${i})`;
  }).join('')}`;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.color_contrast_aa),
    links: [
      {
        content: 'Technique G18: Ensuring that a contrast ratio of at least 4.5:1 exists between text (and images of text) and background behind the text',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/G18'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_AA
  };

  private elementShouldBeSkipped(element: HTMLElement, styles: CSSStyleDeclaration): boolean {
    let elementShouldBeSkipped: boolean = true;

    if (element.hasChildNodes() === false) {
      return elementShouldBeSkipped;
    }

    if (['fixed', 'sticky'].includes(styles.position)) {
      return elementShouldBeSkipped;
    }

    if (Css.getElementBackgroundImage(element, true) !== null) {
      return elementShouldBeSkipped;
    }

    const determinedBackgroundColor: TinyColor | null = Css.getBackgroundColor(element);

    if (determinedBackgroundColor === null) {
      return elementShouldBeSkipped;
    }

    if (determinedBackgroundColor.toName() === 'transparent') {
      return elementShouldBeSkipped;
    }

    if (determinedBackgroundColor.toHex() === new TinyColor(styles.color).toHex()) {
      return elementShouldBeSkipped;
    }

    if (determinedBackgroundColor.getAlpha() < 1) {
      return elementShouldBeSkipped;
    }

    if (DomUtility.hasElementSemiOpacity(element, styles)) {
      return elementShouldBeSkipped;
    }

    const elementStyleBackgroundColor: string | null = Css.getStyle(element, 'background-color');
    let elementBackgroundColor: TinyColor;

    if (elementStyleBackgroundColor === null) {
      elementBackgroundColor = new TinyColor('transparent');
    } else {
      elementBackgroundColor = new TinyColor(elementStyleBackgroundColor);
    }

    if (elementBackgroundColor.toName() !== 'transparent' && DomUtility.hasElementSemiTransparentBackground(element, styles)) {
      return elementShouldBeSkipped;
    }

    if (this.appConfig.get($runnerSettings.includeHidden)) {
      elementShouldBeSkipped = false;

      return elementShouldBeSkipped;
    }

    if (DomUtility.isElementVisible(element) === false) {
      return elementShouldBeSkipped;
    }

    return false;
  }

  public validate(htmlElements: HTMLElement[]): void {
    const checkColorContrast = (element: HTMLElement): void => {

      if (element.hasChildNodes() === false || DomUtility.hasDirectTextDescendant(element) === false || DomUtility.getTextFromDescendantContent(element).trim().length === 0) {
        return;
      }

      const report: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      const styles: CSSStyleDeclaration | null = Css.getComputedStyle(element);

      if (styles === null) {
        report.message = TranslateService.instant('skip_reason_styles_cant_be_determined');
        report.skipReason = $auditRuleNodeSkipReason.stylesCantBeDetermined;

        this.validator.report(report);

        return;
      }

      if (this.elementShouldBeSkipped(element, styles)) {
        report.message = TranslateService.instant('skip_reason_excluded_from_scanning');
        report.skipReason = $auditRuleNodeSkipReason.excludedFromScanning;

        this.validator.report(report);

        return;
      }

      let warningBackgroundImageMessage: string = '';
      const isElementVisible: boolean = DomUtility.isElementVisible(element);
      const noteAboutVisibility: string = TranslateService.instant('color_contrast_aa_note_about_visibility');

      let bgColor: TinyColor = new TinyColor(styles.backgroundColor);
      const fgColor: TinyColor = new TinyColor(styles.color);

      if (bgColor.toName() === 'transparent') {
        const bgColorParent: TinyColor | null = Css.getBackgroundColor(element);

        if (bgColorParent === null) {
          const bodyStyle: CSSStyleDeclaration | null = Css.getComputedStyle(document.body);

          if (bodyStyle !== null) {
            bgColor = new TinyColor(bodyStyle.backgroundColor);

            if (bgColor.toName() === 'transparent') {
              report.message = TranslateService.instant('color_contrast_aa_report_message_2', [`${fgColor.toHexString()}`, `${DomUtility.getEscapedOuterHTML(document.body)}`]);
              report.contrastData = {
                contrastBackground: bgColor.toName() === 'transparent' ? 'transparent' : bgColor.toHexString(),
                contrastColor: fgColor.toName() === 'transparent' ? 'transparent' : bgColor.toHexString(),
                contrastRatio: '0'
              };

              this.validator.report(report);

              return;
            }
          }
        } else {
          bgColor = bgColorParent;
        }
      }

      fgColor.setAlpha(styles.opacity);

      const contrastRatio: string = String(parseFloat(readability(bgColor, fgColor).toFixed(2)));
      const backgroundImage: string | null = Css.getStyle(element, 'background-image');
      const originalFontSize: string | null = Css.getStyle(element, 'font-size');

      if (originalFontSize === null) {
        report.message = TranslateService.instant('skip_reason_specified_styles_cant_be_determined', ['font-size']);
        report.skipReason = $auditRuleNodeSkipReason.specifiedStylesCantBeDetermined;

        this.validator.report(report);

        return;
      }

      const fontSizeInPt: number = Css.covertPxToPt(originalFontSize, true);
      const fontWeight: string | null = Css.getStyle(element, 'font-weight');

      if (typeof backgroundImage !== 'string' || ['', 'none'].includes(backgroundImage.trim()) === false) {
        warningBackgroundImageMessage = TranslateService.instant('color_contrast_aa_warning_message');
      }

      if (Css.isLargeText(element)) {
        const isReadableLargeSize: boolean = isReadable(bgColor, fgColor, {
          level: 'AA',
          size: 'large'
        });

        if (isReadableLargeSize === false) {
          report.message = TranslateService.instant('color_contrast_aa_report_message_4', [`${contrastRatio}`, `${bgColor.toHexString()}`, `${fgColor.toHexString()}`, `${fontSizeInPt}pt`, `${originalFontSize}`, fontWeight ? fontWeight : '', `${warningBackgroundImageMessage}`]) + (isElementVisible === false ? ` ${noteAboutVisibility}` : '');
          report.contrastData = {
            contrastBackground: bgColor.toHexString(),
            contrastColor: fgColor.toHexString()
          };

          this.validator.report(report);

          return;
        }
      }

      const isReadableSmallSize: boolean = isReadable(bgColor, fgColor, {
        level: 'AA',
        size: 'small'
      });

      if (isReadableSmallSize === false) {
        report.message = TranslateService.instant('color_contrast_aa_report_message_5', [`${contrastRatio}`, `${bgColor.toHexString()}`, `${fgColor.toHexString()}`, `${fontSizeInPt}pt`, `${originalFontSize}`, fontWeight ? fontWeight : '', `${warningBackgroundImageMessage}`]) + (isElementVisible === false ? ` ${noteAboutVisibility}` : '');
        report.contrastData = {
          contrastBackground: bgColor.toHexString(),
          contrastColor: fgColor.toHexString()
        };

        this.validator.report(report);

        return;
      }
    };

    htmlElements.forEach(checkColorContrast);
  }
}
