import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class HorizontalRule extends AbstractRule {
  protected selector: string = `hr${[
    ':not([aria-hidden="true"])',
    ':not([role="presentation"])'
  ].join('')}`;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.horizontal_rule),
    links: [],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLHRElement[]): void {
    const reportHR = (element: HTMLHRElement): void => {
      const reportMessage: string = TranslateService.instant('horizontal_rule_report_message', [TextUtility.escape('<hr>'), TextUtility.escape('<hr>'), TextUtility.escape('<div>'), TextUtility.escape('<hr>')]);

      const report: IIssueReport = {
        message: reportMessage,
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(reportHR);
  }
}
