import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

// Note: review this rule
export class MeaningfulContentSequence extends AbstractRule {
  protected selector: () => HTMLElement[] = (): HTMLElement[] => {
    return [DomUtility.getRootElement()];
  }

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.meaningful_content_sequence),
    links: [
      {
        content: 'G57: Ordering the content in a meaningful sequence',
        url: 'https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/G57'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(htmlElements: HTMLElement[]): void {
    const reportNode = (htmlElement: HTMLElement): void => {
      const message: string = TranslateService.instant('meaningful_content_sequence_report_message');

      const report: IIssueReport = {
        message: message,
        node: htmlElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    htmlElements.forEach(reportNode);
  }
}
