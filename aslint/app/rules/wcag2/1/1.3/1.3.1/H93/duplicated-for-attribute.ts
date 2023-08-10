import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class DuplicatedForAttribute extends AbstractRule {
  protected selector: string = 'label[for]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.duplicated_for_attribute),
    links: [
      {
        content: 'H93: Ensuring that id attributes are unique on a Web page',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H93.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(labelElements: HTMLLabelElement[]): void {
    const fors: any = {};

    const checkForAttribute = (labelElement: HTMLLabelElement): void => {
      const forValue: string | null = labelElement.getAttribute('for');

      if (forValue === null) {
        return;
      }

      if (fors[forValue]) {
        fors[forValue].elements.push(labelElement);

        return;
      }

      fors[forValue] = {
        elements: [labelElement]
      };
    };

    const showReport = (forValue: string): void => {
      const counter: number = fors[forValue].elements.length;

      if (counter > 1) {

        const reportIssue = (element: Element): void => {
          const report: IIssueReport = {
            message: TranslateService.instant('duplicated_for_attribute_report_message', [forValue, String(counter)]),
            node: element,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);
        };

        fors[forValue].elements.forEach(reportIssue);
      }
    };

    labelElements.forEach(checkForAttribute);
    Object.keys(fors).forEach(showReport);
  }
}
