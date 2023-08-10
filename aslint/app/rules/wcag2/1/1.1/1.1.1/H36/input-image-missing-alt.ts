import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class InputImageMissingAlt extends AbstractRule {
  protected selector: string = 'input[type="image"]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.input_image_missing_alt),
    links: [
      {
        content: 'H36: Using alt attributes on images used as submit buttons',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H36.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(inputElements: HTMLInputElement[]): void {
    const reportNode = (inputElement: HTMLInputElement): void => {
      let message: string = '';
      const altContent: string | null = inputElement.getAttribute('alt');
      const altContentTrimLength: number = typeof altContent === 'string' ? altContent.trim().length : 0;
      const altContentLength: number = typeof altContent === 'string' ? altContent.length : 0;

      if (typeof altContent === 'string' && altContentTrimLength > 0) {
        return;
      }

      if (altContent === null) {
        message = TranslateService.instant('input_image_missing_alt_report_message_1');
      } else if (altContentLength === 0) {
        message = TranslateService.instant('input_image_missing_alt_report_message_2');
      } else if (altContentTrimLength === 0) {
        message = TranslateService.instant('input_image_missing_alt_report_message_3');
      }

      const report: IIssueReport = {
        message: message,
        node: inputElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    inputElements.forEach(reportNode);
  }
}
