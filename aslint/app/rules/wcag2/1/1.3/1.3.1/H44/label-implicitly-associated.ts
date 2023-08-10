import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
import { DomUtility } from '../../../../../../utils/dom';

export class LabelImplicitlyAssociated extends AbstractRule {
  private labelableElements: string[] = [
    'input',
    'meter',
    'output',
    'progress',
    'select',
    'textarea'
  ];

  protected selector: string = 'label';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.label_implicitly_associated),
    links: [
      {
        content: 'H44: Using label elements to associate text labels with form controls',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H44.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(labelElements: HTMLLabelElement[]): void {

    const checkLabelAssociation = (label: HTMLLabelElement): void => {
      const forAttribute: string | null = label.getAttribute('for');
      const trimmedForValue: string | undefined = typeof forAttribute === 'string' ? TextUtility.safeTrim(forAttribute) : undefined;
      const labelableChildElements: NodeListOf<Element> = label.querySelectorAll(this.labelableElements.join(','));

      if (labelableChildElements.length === 0 || labelableChildElements.length === 1 && (forAttribute === null || typeof forAttribute === 'string' && (trimmedForValue as string).length > 0)) {
        return;
      }

      let report: IIssueReport;

      if (typeof forAttribute === 'string' && (trimmedForValue as string).length === 0) {
        report = {
          message: TranslateService.instant('label_implicitly_associated_report_message_1', [DomUtility.getEscapedOuterHTML(label)]),
          node: label,
          ruleId: this.ruleConfig.id
        };
      } else {
        report = {
          message: TranslateService.instant('label_implicitly_associated_report_message_2', [DomUtility.getEscapedOuterHTML(label)]),
          node: label,
          ruleId: this.ruleConfig.id
        };
      }

      this.validator.report(report);
    };

    labelElements.forEach(checkLabelAssociation);
  }
}
