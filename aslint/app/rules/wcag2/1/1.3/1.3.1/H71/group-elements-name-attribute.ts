import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class GroupElementsNameAttribute extends AbstractRule {
  protected selector: string = 'input[name]:not([type="hidden"]):not([aria-hidden="true"])';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.group_elements_name_attribute),
    links: [
      {
        content: 'H71: Providing a description for groups of form controls using fieldset and legend elements',
        url: 'http://www.w3.org/TR/2014/NOTE-WCAG20-TECHS-20140408/H71'
      },
      {
        content: 'ARIA17: Using grouping roles to identify related form controls',
        url: 'http://www.w3.org/TR/2014/NOTE-WCAG20-TECHS-20140408/ARIA17'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(inputElements: HTMLInputElement[]): void {
    const filteredNames: any = {};
    const sorted: any = {};

    const checkElement = (name: string): any => {
      const fieldsetParent: HTMLElement | null = DomUtility.getParentElement(filteredNames[name][0], 'fieldset');

      if (fieldsetParent !== null) {
        return;
      }

      const reportIssue = (inputElement: HTMLInputElement): void => {
        const report: IIssueReport = {
          message: TranslateService.instant('group_elements_name_attribute_report_message'),
          node: inputElement,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      };

      filteredNames[name].forEach(reportIssue);
    };

    const saveAmountOfNames = (inputElement: HTMLInputElement): boolean => {
      const nameValue: string = inputElement.name;

      if (Object.prototype.hasOwnProperty.call(sorted, nameValue)) {
        sorted[nameValue] += 1;
      } else {
        sorted[nameValue] = 1;
      }

      return true;
    };

    const sortElements = (node: HTMLInputElement): boolean => {
      if (sorted[node.name] === 1) {
        return false;
      }

      if (filteredNames[node.name] === undefined) {
        filteredNames[node.name] = [];
      }

      filteredNames[node.name].push(node);

      return true;
    };

    inputElements.filter(saveAmountOfNames).forEach(sortElements);

    Object.keys(filteredNames).forEach(checkElement);
  }
}
