import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity, $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
import { ObjectUtility } from '../../../../../../utils/object';
import { DomUtility } from '../../../../../../utils/dom';

/*
 * https://www.w3.org/TR/svg-aam-1.0/
 *
 * SVG user agents MUST provide an accessible object in the accessibility tree for rendered SVG elements that meet any of the following criteria, unless they are excluded from the accessibility tree per the rules in Excluding Elements from the Accessibility Tree:
 *
 * It has at least one direct child ‘title’ element or ‘desc' element that is not empty after trimming whitespace. User agents MAY include elements with these child elements without checking for valid text content.
 * It has a non-empty (after trimming whitespace) ‘aria-label’ attribute or ‘aria-roledescription’ attribute.
 * It has an ‘aria-labelledby’ attribute or ‘aria-describedby’ attribute containing valid IDREF tokens. User agents MAY include elements with these attributes without checking for validity.
 * It has a valid integer 'tabindex' attribute.
 * The author has provided an allowed, non-abstract WAI-ARIA role other than none or presentation.
 */

const suggestedSolutions: string = `${TextUtility.escape('<title>, <desc>, <text>, aria-label, aria-labelledby, aria-describedby, aria-roledescription')}`;

export class AccessibleSvg extends AbstractRule {
  protected selector: string = 'svg:not([role="presentation"])';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.accessible_svg),
    links: [
      {
        content: 'Writing accessible SVG',
        url: 'https://w3c.github.io/writing-accessible-svg/accessible-svg.html'
      },
      {
        content: 'Appendix C: Accessibility Support',
        url: 'https://www.w3.org/TR/SVG2/access.html'
      },
      {
        content: 'Success Criterion 1.1.1 Non-text Content',
        url: 'https://www.w3.org/TR/WCAG21/#non-text-content'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(htmlOrSVGElements: SVGElement[]): void {
    const checkForAnAccessibilityIssues = (svgElement: SVGElement): void => {
      const role: string | null = svgElement.getAttribute('role');

      if (typeof role === 'string' && role === 'presentation') {
        return;
      }

      const isHiddenForATbyParent: boolean = DomUtility.isHiddenForAT(svgElement);

      if (isHiddenForATbyParent) {
        return;
      }

      const report: IIssueReport = {
        message: '',
        node: svgElement,
        ruleId: this.ruleConfig.id
      };

      const reportMessage: string[] = [];

      const titleElement: HTMLTitleElement | null = svgElement.querySelector('title');
      const descElement: SVGDescElement | null = svgElement.querySelector('desc');
      const textElement: SVGTextElement | null = svgElement.querySelector('text');

      const ariaLabel: string | null = svgElement.getAttribute('aria-label');
      const ariaLabelledBy: string | null = svgElement.getAttribute('aria-labelledby');
      const ariaDescribedby: string | null = svgElement.getAttribute('aria-describedby');
      const ariaRoleDescription: string | null = svgElement.getAttribute('aria-roledescription');
      const tabIndex: string | null = svgElement.getAttribute('tabindex');

      if (typeof tabIndex === 'string' && ObjectUtility.isNumber(tabIndex) === false) {
        reportMessage.push(TranslateService.instant('accessible_svg_report_message_4', [svgElement.getAttribute('tabindex')]));
      }

      if (titleElement === null && descElement === null && textElement === null && ariaLabel === null && ariaRoleDescription === null && ariaLabelledBy === null && ariaDescribedby === null) {
        reportMessage.push(TranslateService.instant('accessible_svg_report_message_1', [svgElement.nodeName.toLowerCase(), suggestedSolutions]));

        report.message = this.validator.createReportMessage(reportMessage);

        this.validator.report(report);

        return;
      }

      if (titleElement !== null) {
        if (typeof titleElement.textContent !== 'string' || titleElement.textContent.trim().length === 0) {
          reportMessage.push(TranslateService.instant('accessible_svg_report_message_2', svgElement.nodeName.toLowerCase()));
        } else {
          return;
        }
      }

      if (descElement !== null) {
        if (typeof descElement.textContent !== 'string' || descElement.textContent.trim().length === 0) {
          reportMessage.push(TranslateService.instant('accessible_svg_report_message_2', svgElement.nodeName.toLowerCase()));
        } else {
          return;
        }
      }

      if (textElement !== null) {
        if (typeof textElement.textContent !== 'string' || textElement.textContent.trim().length === 0) {
          reportMessage.push(TranslateService.instant('accessible_svg_report_message_2', svgElement.nodeName.toLowerCase()));
        } else {
          return;
        }
      }

      if (ariaLabel !== null) {
        if (ariaLabel.trim().length === 0) {
          reportMessage.push(TranslateService.instant('accessible_svg_report_message_2', ['aria-label']));
        } else {
          return;
        }
      }

      if (ariaRoleDescription !== null) {
        if (ariaRoleDescription.trim().length === 0) {
          reportMessage.push(TranslateService.instant('accessible_svg_report_message_2', ['aria-roledescription']));
        } else {
          return;
        }
      }

      if (typeof ariaLabelledBy === 'string') {
        const ids: string[] = ariaLabelledBy.split(/\s+/);

        const existingElements = (elementId: string): boolean => {
          return document.getElementById(elementId) === null;
        };

        const missingAssociatedElements: string[] = ids.filter(existingElements);

        if (missingAssociatedElements.length > 0) {
          reportMessage.push(TranslateService.instant('accessible_svg_report_message_3', ['aria-labelledby', missingAssociatedElements.join(', ')]));
        } else {
          return;
        }
      }

      if (typeof ariaDescribedby === 'string') {
        const ids: string[] = ariaDescribedby.split(/\s+/);

        const existingElements = (elementId: string): boolean => {
          return document.getElementById(elementId) === null;
        };

        const missingAssociatedElements: string[] = ids.filter(existingElements);

        if (missingAssociatedElements.length > 0) {
          reportMessage.push(TranslateService.instant('accessible_svg_report_message_3', ['aria-describedby', missingAssociatedElements.join(', ')]));
        } else {
          return;
        }
      }

      if (reportMessage.length === 0) {
        return;
      }

      report.message = reportMessage.join('\n\n');

      this.validator.report(report);
    };

    htmlOrSVGElements.forEach(checkForAnAccessibilityIssues);
  }
}
