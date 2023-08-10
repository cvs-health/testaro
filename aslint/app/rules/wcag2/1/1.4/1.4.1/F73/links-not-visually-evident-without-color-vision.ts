import { $accessibilityAuditRules, $severity } from '../../../../../../constants/accessibility';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { Css } from '../../../../../../utils/css';
import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
export class LinksNotVisuallyEvidentWithoutColorVision extends AbstractRule {
  protected selector: string = 'a:not(:empty)';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.links_not_visually_evident_without_color_vision),
    links: [
      {
        content: 'Failure of Success Criterion 1.4.1 due to creating links that are not visually evident without color vision',
        url: 'https://www.w3.org/WAI/WCAG21/Techniques/failures/F73'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const checkLink = (element: Element): any => {
      const problem: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      const textContent: string = DomUtility.getTextFromDescendantContent(element);

      // Note: :empty does not handle liner carriers
      if (DomUtility.hasDirectTextDescendant(element as HTMLElement) === false || textContent.trim().length === 0) {
        return;
      }

      const element_computedStyle: CSSStyleDeclaration | null = Css.getComputedStyle(element);
      const parentElement: HTMLElement | null = element.parentElement;

      if (element_computedStyle === null || parentElement === null) {
        return;
      }

      const parent_computedStyle: CSSStyleDeclaration | null = Css.getComputedStyle(parentElement);

      if (parent_computedStyle === null) {
        return;
      }

      const element_background: string = element_computedStyle.getPropertyValue('background');
      const element_color: string = element_computedStyle.getPropertyValue('color');
      const element_fontStyle: string = element_computedStyle.getPropertyValue('font-style');
      const element_textDecoration: string = element_computedStyle.getPropertyValue('text-decoration');

      const parent_background: string = parent_computedStyle.getPropertyValue('background');
      const parent_color: string = parent_computedStyle.getPropertyValue('color');
      const parent_fontStyle: string = parent_computedStyle.getPropertyValue('font-style');
      const parent_textDecoration: string = parent_computedStyle.getPropertyValue('text-decoration');

      if (element_fontStyle !== parent_fontStyle || element_textDecoration !== parent_textDecoration || element_background !== parent_background || element_color !== parent_color) {
        return;
      }

      problem.message = TranslateService.instant('links_not_visually_evident_without_color_vision_report_message', [`background: ${element_background}; color: ${element_color}; font-style: ${element_fontStyle}; text-decoration: ${element_textDecoration}`, `background: ${parent_background}; color: ${parent_color}; font-style: ${parent_fontStyle}; text-decoration: ${parent_textDecoration}`]);
      this.validator.report(problem);
    };

    elements.forEach(checkLink);
  }
}
