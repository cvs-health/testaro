import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../services/translate';
import { $severity, $accessibilityAuditRules } from '../../../constants/accessibility';
import { TextUtility } from '../../../utils/text';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class AriaRoleDialog extends AbstractRule {
  protected selector: string = '[role="dialog"], [role="alertdialog"]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.aria_role_dialog),
    links: [],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    const reportProblem = (element: Element): void => {

      const ariaLabelledby: string | null = element.getAttribute('aria-labelledby');
      const ariaLabel: string | null = element.getAttribute('aria-label');
      const titleAttr: string | null = element.getAttribute('title');
      const roleAttr: string | null = element.getAttribute('role');

      let reportMessage: string = '';

      if (typeof ariaLabelledby === 'string') {
        if (ariaLabelledby.trim().length > 0) {
          return;
        }

        reportMessage = TranslateService.instant('aria_role_dialog_report_message_1', [TextUtility.escape(`role="${roleAttr}"`), TextUtility.escape('aria-labelledby')]);
      } else if (typeof ariaLabel === 'string') {
        if (ariaLabel.trim().length > 0) {
          return;
        }

        reportMessage = TranslateService.instant('aria_role_dialog_report_message_1', [TextUtility.escape(`role="${roleAttr}"`), TextUtility.escape('aria-label')]);
      } else if (typeof titleAttr === 'string') {
        if (titleAttr.trim().length > 0) {
          return;
        }

        reportMessage = TranslateService.instant('aria_role_dialog_report_message_1', [TextUtility.escape(`role="${roleAttr}"`), TextUtility.escape('title')]);
      } else {
        reportMessage = TranslateService.instant('aria_role_dialog_report_message_2', [TextUtility.escape(`role="${roleAttr}"`)]);
      }

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
