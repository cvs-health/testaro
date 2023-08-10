import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';
export class MisusedRequiredAttribute extends AbstractRule {
  protected selector: string = '[required][aria-required]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.misused_required_attribute),
    links: [
      {
        content: 'Attribute required',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-required'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {
    const requiredElms: HTMLElement[] = elements;
    const notUseOnType: string[] = [
      'hidden',
      'image'
    ];
    const notUseOnButtonType: string[] = [
      'submit',
      'reset',
      'button'
    ];

    const showMessage = (element: HTMLElement): void => {
      let report: IIssueReport | undefined;
      const ariaRequiredValue: string | null = element.getAttribute('aria-required');
      const elementRequiredValue: string | null = element.getAttribute('required');
      const nodeName: string = element.nodeName.toLowerCase();

      if (ariaRequiredValue && elementRequiredValue === null ||
        (typeof (element as any).type === 'string' && notUseOnType.indexOf((element as any).type) !== -1 ||
        nodeName === 'button' && notUseOnButtonType.indexOf((element as HTMLButtonElement).type) !== -1)
      ) {
        const reportMessage: string = TranslateService.instant('misused_required_attribute_report_message1', [ariaRequiredValue]);

        report = {
          message: reportMessage,
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);

        return;
      }

      if (elementRequiredValue === null) {
        return;
      }

      if (elementRequiredValue === ariaRequiredValue) {
        const reportMessage: string = TranslateService.instant('misused_required_attribute_report_message2', [ariaRequiredValue]);

        report = {
          message: reportMessage,
          node: element,
          ruleId: this.ruleConfig.id
        };
      } else {
        const reportMessage: string = TranslateService.instant('misused_required_attribute_report_message3', [ariaRequiredValue, element.getAttribute('required')]);

        report = {
          message: reportMessage,
          node: element,
          ruleId: this.ruleConfig.id
        };
      }

      if (typeof report === 'undefined') {
        return;
      }

      this.validator.report(report);
    };

    requiredElms.forEach(showMessage);
  }
}
