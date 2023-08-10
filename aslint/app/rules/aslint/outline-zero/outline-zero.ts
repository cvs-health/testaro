import { DomUtility } from '../../../utils/dom';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { Config } from '../../../config';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class OutlineZero extends AbstractRule {
  private appConfig: Config = Config.getInstance();

  protected selector: () => CSSStyleSheet[] = (): CSSStyleSheet[] => {
    return Array.from(document.styleSheets);
  };

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.outline_zero),
    links: [
      {
        content: 'F55: Failure of Success Criteria 2.1.1, 2.4.7, and 3.2.1 due to using script to remove focus when focus is received',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/F55.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(styleSheets: CSSStyleSheet[]): void {
    if (styleSheets.length === 0) {
      return;
    }

    const findOutlineZero = (styles: CSSStyleSheet): void => {
      let currentRule: CSSRule;
      let outlineWidthSize: number;
      let selector: string;
      let styleObject: any;
      let isCSSembededInline: string;
      let href: string | null;
      const defaultSizeValues: string[] = ['thin', 'medium', 'thick'];

      if (styles.hasOwnProperty('rules') === false || styles.href && styles.href.indexOf(this.appConfig.get('cssTitle')) !== -1) {
        return;
      }

      const rules: CSSRuleList = styles.rules;
      const rulesLength: number = rules.length;

      for (let i: number = 0; i < rulesLength; i += 1) {
        currentRule = rules[i];
        styleObject = (currentRule as CSSStyleRule).style;

        if (styleObject && styleObject.outlineWidth !== '' && defaultSizeValues.indexOf(styleObject.outlineWidth) === -1) {
          outlineWidthSize = Number(styleObject.outlineWidth.replace(/[^\d.-]/g, ''));

          if (outlineWidthSize === 0) {
            href = (currentRule as any).parentStyleSheet.href;

            if (href) {
              isCSSembededInline = TranslateService.instant('outline_zero_css_embeded_1', [href]);
            } else {
              isCSSembededInline = TranslateService.instant('outline_zero_css_embeded_2', [DomUtility.getEscapedOuterHTML((currentRule as any).parentStyleSheet.ownerNode)]);
            }

            selector = currentRule.cssText.replace(/(outline.*?;)/i, '<em>$1</em>');
            const reportMessage: string = TranslateService.instant('outline_zero_report_message', [styleObject.outlineWidth, selector, isCSSembededInline]);

            const report: IIssueReport = {
              message: reportMessage,
              node: null,
              ruleId: this.ruleConfig.id
            };

            this.validator.report(report);
          }
        }
      }
    };

    styleSheets.forEach(findOutlineZero);
  }
}
