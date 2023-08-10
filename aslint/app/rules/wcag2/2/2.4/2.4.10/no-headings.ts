import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../utils/text';
import { TranslateService } from '../../../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';

export class NoHeadings extends AbstractRule {
  protected selector: string = 'h1, h2, h3, h4, h5, h6';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.no_headings),
    links: [
      {
        content: 'Section headings are used to organize the content.',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-headings.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_AAA
  };

  public validate(nodes: Element[]): void {
    if (nodes.length > 0) {
      return;
    }

    const report: IIssueReport = {
      message: TranslateService.instant('no_headings_report_message'),
      node: null,
      ruleId: this.ruleConfig.id
    };

    this.validator.report(report);
  }
}
