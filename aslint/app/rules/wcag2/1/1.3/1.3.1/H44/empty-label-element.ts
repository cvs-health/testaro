import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class EmptyLabelElement extends AbstractRule {
  protected selector: string = 'label';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.empty_label_element),
    links: [
      {
        content: 'H44: Using label elements to associate text labels with form controls',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/H44.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(labelElements: HTMLLabelElement[]): void {
    const reportEmptyLabel = (label: HTMLLabelElement): any => {
      const content: string = DomUtility.nodesToText(label);
      const contentLength: number = content.length;

      if (contentLength === 0) {
        const report: IIssueReport = {
          message: TranslateService.instant('empty_label_element_report_message', [DomUtility.getEscapedOuterHTML(label)]),
          node: label,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    labelElements.forEach(reportEmptyLabel);
  }
}
