import { $accessibilityAuditRules, $severity } from '../../../../../../constants/accessibility';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class EmptyButtonDescription extends AbstractRule {
  protected selector: string = 'button, [role="button"]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.empty_button_description),
    links: [
      {
        content: 'H91: Using HTML form controls and links',
        url: 'https://www.w3.org/WAI/WCAG21/Techniques/html/H91.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const reportEmptyButtonDescription = (element: Element): void => {
      const content: string = DomUtility.nodesToText(element);
      const reportMessage: string[] = [];

      const ariaHidden: string | null = element.getAttribute('aria-hidden');
      const ariaLabel: string | null = element.getAttribute('aria-label');
      const ariaLabelledBy: string | null = element.getAttribute('aria-labelledby');

      const reportIssue: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      if (typeof ariaHidden === 'string' && ariaHidden === 'true') {
        return;
      }

      const contentTrimmed: string = TextUtility.safeTrim(content);

      if (content.length > 0 && TextUtility.containsOnlyWhiteSpaces(content)) {
        reportMessage.push(TranslateService.instant('empty_button_description_report_message_1'));
      } else if (element.childNodes.length === 0 || content.length === 0) {
        reportMessage.push(TranslateService.instant('empty_button_description_report_message_2'));
      }

      if (typeof ariaLabel === 'string' && ariaLabel.trim().length > 0) {
        if (contentTrimmed.length === 0) {
          reportMessage.push(TranslateService.instant('empty_button_description_report_message_3', [`aria-label="${ariaLabel}"`]));
        }
      }

      if (typeof ariaLabelledBy === 'string') {
        const ids: string[] = ariaLabelledBy.split(/\s+/);

        const existingElements = (elementId: string): boolean => {
          return document.getElementById(elementId) === null;
        };

        const missingAssociatedElements: string[] = ids.filter(existingElements);

        if (missingAssociatedElements.length > 0) {
          reportMessage.push(TranslateService.instant('empty_button_description_additional_message', [ariaLabelledBy, missingAssociatedElements.join(' ')]));
        }
      }

      if (reportMessage.length === 0) {
        return;
      }

      reportIssue.message = reportMessage.join(' ');

      this.validator.report(reportIssue);
    };

    elements.forEach(reportEmptyButtonDescription);
  }
}
