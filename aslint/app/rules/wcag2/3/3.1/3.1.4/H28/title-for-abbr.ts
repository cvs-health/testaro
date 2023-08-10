import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class TitleForAbbr extends AbstractRule {
  protected selector: string = 'abbr';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.title_for_abbr),
    links: [
      {
        content: 'H28: Providing definitions for abbreviations by using the abbr element',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H28.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_AAA
  };

  public validate(elements: Element[]): void {
    const reportTitle = (element: Element): void => {
      const report: IIssueReport = {
        message: TranslateService.instant('title_for_abbr_report_message_1'),
        node: element,
        ruleId: this.ruleConfig.id
      };

      const titleAttribute: string | null = element.getAttribute('title');

      if (typeof titleAttribute === 'string') {
        if (TextUtility.safeTrim(titleAttribute).length === 0) {
          report.message = TranslateService.instant('title_for_abbr_report_message_2');
        } else {
          return;
        }
      }

      this.validator.report(report);
    };

    elements.forEach(reportTitle);
  }
}
