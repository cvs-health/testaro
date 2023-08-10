import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class MissingHrefOnA extends AbstractRule {
  protected selector: string = 'a:not([href])';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.missing_href_on_a),
    links: [
      {
        content: 'F42: Failure of Success Criteria 1.3.1, 2.1.1, 2.1.3, or 4.1.2 when emulating links',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/F42.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(anchorElements: HTMLAnchorElement[]): void {
    const reportNodeWithoutHref = (anchorElement: HTMLAnchorElement): void => {
      const reportMessage: string = TranslateService.instant('missing_href_on_a_report_message', [TextUtility.escape('<a>')]);

      const report: IIssueReport = {
        message: reportMessage,
        node: anchorElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    anchorElements.forEach(reportNodeWithoutHref);
  }
}
