import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class H1MustBe extends AbstractRule {
  protected selector: string = 'h1';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.h1_must_be),
    links: [
      {
        content: 'Web Accessibility Tutorials: Headings',
        url: 'https://www.w3.org/WAI/tutorials/page-structure/headings/'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    if (elements.length > 0) {
      return;
    }

    const report: IIssueReport = {
      message: TranslateService.instant('h1_must_report_message'),
      node: null,
      ruleId: this.ruleConfig.id
    };

    this.validator.report(report);
  }
}
