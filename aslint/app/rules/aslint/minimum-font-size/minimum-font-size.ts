import { DomUtility } from '../../../utils/dom';
import { Css } from '../../../utils/css';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class MinimumFontSize extends AbstractRule {
  protected selector: string = `*${[
    ':root',
    'head',
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
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.minimum_font_size),
    links: [],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {
    const checkFontSize = (element: HTMLElement): void => {
      if (DomUtility.hasDirectTextDescendant(element) === false) {
        return;
      }

      const fontSizeStyle: string | null = Css.getStyle(element, 'font-size');

      if (fontSizeStyle === null) {
        return;
      }

      const fontSize: number = parseInt(fontSizeStyle, 10);

      if (fontSize < 10) {
        let report: IIssueReport;

        if (DomUtility.isElementVisible(element) === false) {
          const reportMessage: string = TranslateService.instant('minimum_font_size_report_message_1', [fontSize]);

          report = {
            message: reportMessage,
            node: element,
            ruleId: this.ruleConfig.id
          };
        } else {
          const reportMessage: string = TranslateService.instant('minimum_font_size_report_message_2', [fontSize]);

          report = {
            message: reportMessage,
            node: element,
            ruleId: this.ruleConfig.id
          };
        }

        this.validator.report(report);
      }
    };

    elements.forEach(checkFontSize);
  }
}
