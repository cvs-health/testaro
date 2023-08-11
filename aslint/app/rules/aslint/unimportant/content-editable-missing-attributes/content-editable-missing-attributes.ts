import { DomUtility } from '../../../utils/dom';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class ContentEditableMissingAttributes extends AbstractRule {
  protected selector: string = '[contenteditable]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.content_editable_missing_attributes),
    links: [],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    const reportMissingAttributes = (element: Element): void => {
      let problem: IIssueReport;
      const roleValue: string | null = element.getAttribute('role');

      if (roleValue !== 'textbox') {
        const reportMessage: string = TranslateService.instant('content_editable_missing_attributes_report_message1', [DomUtility.getEscapedOuterHTML(element)]);

        problem = {
          message: reportMessage,
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(problem);
      }

      if (element.getAttribute('aria-multiline') === null) {
        const reportMessage: string = TranslateService.instant('content_editable_missing_attributes_report_message2', [DomUtility.getEscapedOuterHTML(element)]);

        problem = {
          message: reportMessage,
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(problem);
      }

      if (element.getAttribute('aria-labelledby') === null && element.getAttribute('aria-label') === null) {
        const reportMessage: string = TranslateService.instant('content_editable_missing_attributes_report_message3', [DomUtility.getEscapedOuterHTML(element)]);

        problem = {
          message: reportMessage,
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(problem);
      }
    };

    elements.forEach(reportMissingAttributes);
  }
}
