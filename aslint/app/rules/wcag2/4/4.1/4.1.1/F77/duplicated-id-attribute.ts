import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

// Note: this rule is following https://www.w3.org/TR/2010/WD-html-markup-20100624/datatypes.html#common.data.id-def
export class DuplicatedIdAttribute extends AbstractRule {
  protected selector: string = '[id]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.duplicated_id_attribute),
    links: [
      {
        content: 'H93: Ensuring that id attributes are unique on a Web page',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H93.html'
      },
      {
        content: 'F77: Failure of Success Criterion 4.1.1 due to duplicate values of type ID',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/F77.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const ids: any = {};

    const checkIdAttribute = (element: Element): void => {
      let idAttr: string | null = element.getAttribute('id');

      if (typeof idAttr !== 'string' || idAttr.length === 0) {
        return;
      }

      idAttr = TextUtility.normalizeWhitespaces(idAttr).trim();

      /*
       *  Note: if attribute id value contains a space character https://www.w3.org/TR/2010/WD-html-markup-20100624/terminology.html#space
       *        then it's considered as invalid value
       */
      if (TextUtility.containsSpaceCharacter(idAttr)) {
        return;
      }

      if (ids[element.id]) {
        ids[element.id].elements.push(element);
      } else {
        ids[element.id] = {
          elements: [element]
        };
      }
    };

    const showReport = (id: string): void => {
      const counter: number = ids[id].elements.length;

      if (counter > 1) {
        const reportIssue = (element: Element): void => {
          const report: IIssueReport = {
            message: TranslateService.instant('duplicated_id_attribute_report_message', [id, counter]),
            node: element,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);
        };

        ids[id].elements.forEach(reportIssue);
      }
    };

    elements.forEach(checkIdAttribute);
    Object.keys(ids).forEach(showReport);
  }
}
