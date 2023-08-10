import { $accessibilityAuditRules, $severity } from '../../../../../constants/accessibility';
import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../services/translate';
import { DomUtility } from '../../../../../utils/dom';
import { TextUtility } from '../../../../../utils/text';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';

export class Reflow extends AbstractRule {
  protected selector: () => HTMLElement[] = (): HTMLElement[] => {
    return [DomUtility.getRootElement()];
  };

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.reflow),
    links: [
      {
        content: 'Understanding Success Criterion 1.4.10: Reflow',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/reflow.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_AA
  };

  public validate(elements: HTMLElement[]): void {
    if (elements.length === 0) {
      return;
    }

    const report: IIssueReport = {
      message: TranslateService.instant('reflow_report_message'),
      node: elements[0],
      ruleId: this.ruleConfig.id
    };

    this.validator.report(report);
  }
}
