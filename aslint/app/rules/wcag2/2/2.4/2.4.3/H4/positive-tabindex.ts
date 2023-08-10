import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class PositiveTabindex extends AbstractRule {
  protected selector: string = '[tabindex]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.positive_tabindex),
    links: [
      {
        content: 'H4: Creating a logical tab order through links, form controls, and objects',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H4.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(htmlElements: HTMLElement[]): void {
    const checkTabindex = (htmlElement: HTMLElement): void => {
      const tabindexValue: number = htmlElement.tabIndex;

      if (tabindexValue < 1) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('positive_tabindex_report_message', [tabindexValue]),
        node: htmlElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    htmlElements.forEach(checkTabindex);
  }
}
