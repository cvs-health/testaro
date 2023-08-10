import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
import { DomUtility } from '../../../../../../utils/dom';

export class FieldsetNoLegend extends AbstractRule {
  protected selector: string = 'fieldset > :first-child:not(legend)';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.fieldset_no_legend),
    links: [
      {
        content: 'H71: Providing a description for groups of form controls using fieldset and legend elements',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H71.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: HTMLElement[]): void {
    const checkNode = (element: HTMLElement): void => {
      const findParentFieldset: Element | null = DomUtility.getParentElement(element, 'fieldset');

      const report: IIssueReport = {
        message: TranslateService.instant('fieldset_no_legend_report_message', [TextUtility.escape(element.nodeName.toLowerCase()), DomUtility.getEscapedOuterTruncatedHTML(findParentFieldset)]),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(checkNode);
  }
}
