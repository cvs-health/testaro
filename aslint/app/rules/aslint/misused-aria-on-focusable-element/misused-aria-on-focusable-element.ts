import { DomUtility } from '../../../utils/dom';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { FOCUSABLE_ELEMENTS } from '../../../constants/focusableElements';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class MisusedAriaOnFocusableElement extends AbstractRule {
  protected selector: string = FOCUSABLE_ELEMENTS
    .map((i: string): string => {
      return `${i}[role="presentation"], ${i}[aria-hidden="true"]`;
    })
    .join(', ');

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.misused_aria_on_focusable_element),
    links: [
      {
        content: 'Do not use role="presentation" or aria-hidden="true" on a visible focusable element',
        url: 'https://w3c.github.io/using-aria/#4thrule'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {
    const checkSupportForTabindex = (element: HTMLElement): void => {
      const rolePresentation: string | null = element.getAttribute('role');
      const ariaHiddenTrue: string | null = element.getAttribute('aria-hidden');
      const attributesToReport: string[] = [];

      if (DomUtility.isElementHidden(element)) {
        return;
      }

      if (rolePresentation) {
        const attribute: string = TranslateService.instant('misused_aria_on_focusable_element_attribute_1');

        attributesToReport.push(attribute);
      }

      if (ariaHiddenTrue === 'true') {
        const attribute: string = TranslateService.instant('misused_aria_on_focusable_element_attribute_2');

        attributesToReport.push(attribute);
      }

      const reportMessage: string = TranslateService.instant('misused_aria_on_focusable_element_report_message', [attributesToReport.join(', ')]);

      const report: IIssueReport = {
        message: reportMessage,
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(checkSupportForTabindex);
  }
}
