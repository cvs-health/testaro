import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class LabelVisuallyHiddenOnly extends AbstractRule {
  protected selector: string = 'label[for]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.label_visually_hidden_only),
    links: [
      {
        content: 'H44: Using label elements to associate text labels with form controls',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H44.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_AA
  };

  public validate(nodes: Element[]): void {
    const checkLabelVisibility = (label: Element): void => {
      if (DomUtility.isVisibleForAssistiveTechnologies(label) && DomUtility.isElementVisible(label) === false) {
        const report: IIssueReport = {
          message: TranslateService.instant('label_visually_hidden_only_report_message', [TextUtility.escape('<label>')]),
          node: label,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    nodes.forEach(checkLabelVisibility);
  }
}
