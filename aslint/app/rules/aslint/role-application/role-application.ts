import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class RoleApplication extends AbstractRule {
  protected selector: string = '[role="application"]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.role_application),
    links: [
      {
        content: 'Using ARIA role=application',
        url: 'https://w3c.github.io/aria-in-html/'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {
    const checkTabindex = (element: HTMLElement): void => {
      const report: IIssueReport = {
        message: TranslateService.instant('role_application_report_message'),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(checkTabindex);
  }
}
