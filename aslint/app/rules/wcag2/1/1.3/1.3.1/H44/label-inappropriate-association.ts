import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class LabelInappropriateAssociation extends AbstractRule {
  private labelableElements: string[] = [
    'input',
    'keygen',
    'meter',
    'output',
    'progress',
    'select',
    'textarea'
  ];

  protected selector: string = 'label';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.label_inappropriate_association),
    links: [
      {
        content: 'H44: Using label elements to associate text labels with form controls',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H44.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(labelElements: HTMLLabelElement[]): void {
    const checkLabelAssociation = (label: HTMLLabelElement): void => {
      const forAttribute: string | null = label.getAttribute('for');
      let report: IIssueReport;

      if (forAttribute === null) {
        return;
      }

      const associatedElement: HTMLElement | null = document.getElementById(forAttribute);

      if (associatedElement === null) {
        report = {
          message: TranslateService.instant('label_inappropriate_association_report_message_1', [TextUtility.escape(`<label for="${forAttribute}">`)]),
          node: label,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);

        return;
      }

      if (this.labelableElements.indexOf(associatedElement.nodeName.toLowerCase()) === -1) {
        report = {
          message: TranslateService.instant('label_inappropriate_association_report_message_2', [TextUtility.escape(`<label for="${forAttribute}">`)]),
          node: label,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    labelElements.forEach(checkLabelAssociation);
  }
}
