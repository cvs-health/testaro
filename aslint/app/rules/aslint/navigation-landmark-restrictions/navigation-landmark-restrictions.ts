import { DomUtility } from '../../../utils/dom';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class NavigationLandmarkRestrictions extends AbstractRule {
  protected selector: string = '[role="navigation"]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.navigation_landmark_restrictions),
    links: [
      {
        content: 'Accessible Rich Internet Applications (WAI-ARIA) 1.0 Specification: navigation role',
        url: 'https://www.w3.org/TR/wai-aria-1.1/#navigation'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    const selector: string = '[role]:not([role="region"]):not([role="search"])';
    const reportMessage: string = TranslateService.instant('navigation_landmark_restrictions_report_message');

    const checkRoleNavigationContent = (htmlElement: Element): void => {
      const childs: HTMLElement[] = DomUtility.querySelectorAll(selector, htmlElement);

      const reportIssue = (element: Element): void => {
        const report: IIssueReport = {
          message: reportMessage,
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      };

      childs.forEach(reportIssue);
    };

    elements.forEach(checkRoleNavigationContent);
  }
}
