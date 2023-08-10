import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class IncorrectLabelPlacement extends AbstractRule {
  protected selector: string = 'input[type="radio"],input[type="checkbox"]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.incorrect_label_placement),
    links: [
      {
        content: 'H44: Using label elements to associate text labels with form controls',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/H44.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(inputElements: HTMLInputElement[]): void {
    const performRuleCheck = (inputElement: HTMLInputElement): any => {
      const parentElement: HTMLElement | null = inputElement.parentElement;

      if (
        parentElement !== null &&
        parentElement.tagName.toLowerCase() === 'label' &&
        parentElement.getAttribute('for') === inputElement.id
      ) {
        return;
      }

      const inputLabel: HTMLLabelElement | null = this.context.querySelector(`label[for="${inputElement.id}"]`);

      if (inputLabel === null) {
        return;
      }

      const successCode: number = Node.DOCUMENT_POSITION_FOLLOWING;

      // Note: check if label placed after its input (correct)
      let labelIsValid: boolean = (inputElement.compareDocumentPosition(inputLabel) & successCode) === successCode;

      // Note: for cases when there're nodes with text between input & label
      if (labelIsValid) {
        let afterInput: boolean = false;
        const allNodes: HTMLCollectionOf<Element> = document.getElementsByTagName('*');

        for (const nodeId in allNodes) {
          if (Object.prototype.hasOwnProperty.call(allNodes, nodeId) === false) {
            continue;
          }

          const node: Element = allNodes[nodeId];

          if (afterInput === false) {
            if (node === inputElement) {
              afterInput = true;
            }
            continue;
          }

          if (node === inputLabel) {
            labelIsValid = true;
            break;
          }

          if ((typeof node.textContent === 'string' && node.textContent.trim()) !== (typeof inputLabel.textContent === 'string' && inputLabel.textContent.trim())) {
            labelIsValid = false;
            break;
          }
        }
      }

      if (labelIsValid) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('incorrect_label_placement_for_associated_input_report_message'),
        node: inputLabel,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    inputElements.forEach(performRuleCheck);
  }
}
