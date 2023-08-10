import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../services/translate';
import { $severity, $accessibilityAuditRules } from '../../../constants/accessibility';
import { TextUtility } from '../../../utils/text';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class AriaHiddenFalse extends AbstractRule {
  protected selector: string = 'body [aria-hidden="false"]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.aria_hidden_false),
    links: [],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    const reportProblem = (element: Element): void => {
      const reportMessage: string = TranslateService.instant('aria_hidden_false_report_message', [TextUtility.escape('aria-hidden="false"'), TextUtility.escape('display: none')]);

      const problem: IIssueReport = {
        message: reportMessage,
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(problem);
    };

    elements.forEach(reportProblem);
  }
}
