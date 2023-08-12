import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class EmptyTitleAttribute extends AbstractRule {
  protected selector: string = `[title]${[
    ':not(img)',
    ':not(html)',
    ':not(head)',
    ':not(title)',
    ':not(body)',
    ':not(link)',
    ':not(meta)',
    ':not(title)',
    ':not(style)',
    ':not(script)',
    ':not(noscript)',
    ':not(iframe)',
    ':not(br)',
    ':not(hr)'
  ].join('')}`;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.empty_title_attribute),
    links: [
      {
        content: 'H67: Using null alt text and no title attribute on img elements for images that AT should ignore',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H67.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    const reportEmptyTitle = (element: Element): void => {
      const titleAttribute: string | null = element.getAttribute('title');

      if (titleAttribute === null || titleAttribute.trim().length > 0) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('empty_title_attribute_report_message'),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(reportEmptyTitle);
  }
}
