import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class MissingSubmitButton extends AbstractRule {
  protected selector: string = 'form';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.missing_submit_button),
    links: [
      {
        content: 'H32: Providing submit buttons',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H32'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(nodes: Element[]): void {
    const checkForSubmitButton = (form: Element): void => {
      const isInputTypeSubmitAvailable: any = form.querySelectorAll('input[type="submit"], input[type="image"], button[type="submit"]');
      let report: IIssueReport;

      if (isInputTypeSubmitAvailable.length > 0) {
        return;
      }

      if (DomUtility.firstElementChild(form) === null) {
        report = {
          message: TranslateService.instant('missing_submit_button_report_message_1'),
          node: form,
          ruleId: this.ruleConfig.id
        };
      } else if (form.querySelector('input[type="hidden"]') !== null) {
        report = {
          message: TranslateService.instant('missing_submit_button_report_message_2', [TextUtility.escape('input type="hidden"')]),
          node: form,
          ruleId: this.ruleConfig.id
        };
      } else {
        report = {
          message: TranslateService.instant('missing_submit_button_report_message_3'),
          node: form,
          ruleId: this.ruleConfig.id
        };
      }

      this.validator.report(report);
    };

    nodes.forEach(checkForSubmitButton);
  }
}
