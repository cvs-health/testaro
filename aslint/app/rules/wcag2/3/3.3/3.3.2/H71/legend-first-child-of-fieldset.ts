import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class LegendFirstChildOfFieldSet extends AbstractRule {
  protected selector: string = 'fieldset > :first-child';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.legend_first_child_of_fieldset),
    links: [
      {
        content: 'H71: Providing a description for groups of form controls using fieldset and legend elements',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H71.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_AA
  };

  public validate(elements: Element[]): void {
    const checkElement = (element: Element): void => {
      const report: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      if (element.nodeName.toLowerCase() !== 'legend') {
        report.message = TranslateService.instant('legend_first_child_of_fieldset_report_message_1', [TextUtility.escape('<legend>'), TextUtility.escape('<fieldset>'), DomUtility.getEscapedOuterHTML(element)]);

        this.validator.report(report);

        return;
      }

      if (typeof element.textContent === 'string' && TextUtility.safeTrim(element.textContent).length === 0) {
        report.message = TranslateService.instant('legend_first_child_of_fieldset_report_message_2', [TextUtility.escape('<legend>'), TextUtility.escape('<fieldset>'), DomUtility.getEscapedOuterHTML(element)]);

        this.validator.report(report);
      }
    };

    elements.forEach(checkElement);
  }
}
