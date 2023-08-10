import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { FOCUSABLE_ELEMENTS } from '../../../../../../constants/focusableElements';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class MisusedTabindexAttribute extends AbstractRule {
  protected selector: string = FOCUSABLE_ELEMENTS.join(', ');
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.misused_tabindex_attribute),
    links: [
      {
        content: 'H4: Creating a logical tab order through links, form controls, and objects',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H4.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const checkSupportForTabindex = (element: Element): void => {
      const tabIndexAttribute: string | null = element.getAttribute('tabindex');

      if (tabIndexAttribute === null || tabIndexAttribute.trim().length === 0) {
        return;
      }

      if (Number(tabIndexAttribute) === 0 && FOCUSABLE_ELEMENTS.indexOf(element.nodeName.toLowerCase()) !== -1) {
        this.validator.report({
          message: TranslateService.instant('misused_tabindex_attribute_report_message_1', [TextUtility.escape(`tabindex="${tabIndexAttribute}"`)]),
          node: element,
          ruleId: this.ruleConfig.id
        });
      }
    };

    elements.forEach(checkSupportForTabindex);
  }
}
