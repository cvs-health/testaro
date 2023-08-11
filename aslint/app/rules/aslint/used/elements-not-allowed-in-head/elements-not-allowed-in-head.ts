import { DomUtility } from '../../../utils/dom';
import { TextUtility } from '../../../utils/text';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class ElementsNotAllowed extends AbstractRule {
  protected selector: string = `head *${[
    ':not(base)',
    ':not(link)',
    ':not(meta)',
    ':not(script)',
    ':not(style)',
    ':not(title)',
    ':not(noscript)',
    ':not(template)'
  ].join('')}`;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.elements_not_allowed_in_head),
    links: [],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    const reportNode = (element: Element): void => {
      const reportMessage: string = TranslateService.instant('elements_not_allowed_in_head_report_message', [
        DomUtility.getEscapedOuterHTML(element),
        TextUtility.escape('<head>')
      ]);

      const report: IIssueReport = {
        message: reportMessage,
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(reportNode);
  }
}
