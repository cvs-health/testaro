import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class InvalidAttributeDirValue extends AbstractRule {
  protected selector: string = '[dir]:not([dir="rtl"]):not([dir="ltr"]):not([dir="auto"])';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.invalid_attribute_dir_value),
    links: [
      {
        content: 'H56: Using the dir attribute on an inline element to resolve problems with nested directional runs',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H56.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {
    const checkValue = (element: HTMLElement): void => {
      const dirAttribute: string | null = element.getAttribute('dir');

      if (dirAttribute === null) {
        return;
      }

      const reportMessage: string = TranslateService.instant('invalid_attribute_dir_value_report_message', [TextUtility.escape(dirAttribute)]);

      const report: IIssueReport = {
        message: reportMessage,
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(checkValue);
  }
}
