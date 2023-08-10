import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class MissingLabel extends AbstractRule {
  // See: https://html.spec.whatwg.org/multipage/forms.html#category-label

  protected selector: string = [
    'input:not([type="hidden"]):not([type="submit"])',
    'meter',
    'output',
    'progress',
    'select',
    'textarea'
  ].join(',');

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.missing_label),
    links: [
      {
        content: 'H44: Using label elements to associate text labels with form controls',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H44.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const checkForLabel = (element: Element): void => {
      const nodeId: string = element.id;
      let report: IIssueReport;

      if (nodeId.trim().length === 0) {
        report = {
          message: TranslateService.instant('missing_label_report_message_1', [DomUtility.getEscapedOuterHTML(element), TextUtility.escape('<label for="[id]">')]),
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);

        return;
      }

      const labelElement: NodeListOf<Element> = document.querySelectorAll(`label[for="${nodeId}"]`);

      if (labelElement.length === 0) {
        report = {
          message: TranslateService.instant('missing_label_report_message_2', [TextUtility.escape(`<label for="${nodeId}">`)]),
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);

        return;
      }

      if (labelElement.length > 1) {
        report = {
          message: TranslateService.instant('missing_label_report_message_3', [TextUtility.escape(`<label for="${nodeId}">`)]),
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }

    };

    elements.forEach(checkForLabel);
  }
}
