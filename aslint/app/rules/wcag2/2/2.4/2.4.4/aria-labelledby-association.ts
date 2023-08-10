import { DomUtility } from '../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../utils/text';
import { TranslateService } from '../../../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';

export class AriaLabelledbyAssociation extends AbstractRule {
  protected selector: string = '[aria-labelledby]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.aria_labelledby_association),
    links: [
      {
        content: '2.4.4 Link Purpose (In Context)',
        url: 'https://www.w3.org/TR/2008/REC-WCAG20-20081211/#navigation-mechanisms-refs'
      },
      {
        content: 'ARIA7: Using aria-labelledby for link purpose',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/ARIA7.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {

    const processNodes = (element: Element): void => {
      const idReferences: string | null = element.getAttribute('aria-labelledby');
      let ids: string[];
      let report: IIssueReport;
      let missingElements: string[];

      const checkElementAvailability = (id: string): boolean => {
        return document.getElementById(id) === null;
      };

      if (typeof idReferences === 'string') {
        if (idReferences.trim().length === 0) {
          report = {
            message: TranslateService.instant('aria_labelledby_association_report_message_2', [DomUtility.getEscapedOuterHTML(element)]),
            node: element,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);
        } else {
          ids = idReferences.split(/ +/).map(Function.prototype.call, String.prototype.trim);

          missingElements = ids.filter(checkElementAvailability);

          if (missingElements.length > 0) {
            report = {
              message: TranslateService.instant('aria_labelledby_association_report_message_1', [missingElements.join(', '), idReferences]),
              node: element,
              ruleId: this.ruleConfig.id
            };

            this.validator.report(report);
          }
        }
      }
    };

    elements.forEach(processNodes);
  }
}
