import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class EmptyHeading extends AbstractRule {
  protected selector: string = 'h1, h2, h3, h4, h5, h6, [role="heading"]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.empty_heading),
    links: [
      {
        content: 'G130: Providing descriptive headings',
        url: 'https://www.w3.org/TR/2012/NOTE-WCAG20-TECHS-20120103/G130'
      },
      {
        content: 'Success Criterion 2.4.6 (Headings and Labels)',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_AA
  };

  public validate(elements: Element[]): void {
    const checkContent = (element: Element): void => {
      let nodeText: string;
      let result: boolean = false;

      if (element.hasChildNodes() === false) {
        result = true;
      } else {
        nodeText = DomUtility.nodesToText(element);

        if (TextUtility.safeTrim(nodeText).length === 0) {
          result = true;
        }
      }

      if (result === false) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('empty_heading_report_message'),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(checkContent);
  }
}
