import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class LinkButtonSpaceKey extends AbstractRule {
  protected selector: string = 'a[role="button"]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.link_button_space_key),
    links: [
      {
        content: 'SCR35: Making actions keyboard accessible by using the onclick event of anchors and buttons',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/SCR35'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const reportNode = (element: Element): void => {
      const problem: IIssueReport = {
        message: TranslateService.instant('link_button_space_key_report_message', [TextUtility.escape('role="button"'), TextUtility.escape('<a>')]),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(problem);
    };

    elements.forEach(reportNode);
  }
}
