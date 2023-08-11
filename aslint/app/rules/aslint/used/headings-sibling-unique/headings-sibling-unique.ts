import { TextUtility } from '../../../utils/text';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class HeadingsSiblingUnique extends AbstractRule {
  protected selector: string = 'h1, h2, h3, h4, h5, h6';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.headings_sibling_unique),
    links: [
      {
        content: '2.4.6 Headings and Labels (Level AA, Primary Success Criterion)',
        url: 'http://www.w3.org/TR/WCAG20/#navigation-mechanisms-descriptive'
      },
      {
        content: 'G130: Providing descriptive headings',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/G130'
      },
      {
        content: 'G141: Organizing a page using headings',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/G141.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_AA
  };

  public validate(headings: HTMLHeadingElement[]): void {

    const checkForSiblings = (headingElement: HTMLHeadingElement): void => {
      const nextElementSibling: Element | null = headingElement.nextElementSibling;

      if (nextElementSibling === null) {
        return;
      }

      if (nextElementSibling.nodeName.toLowerCase() !== headingElement.nodeName.toLowerCase()) {
        return;
      }

      const headingText: string = typeof headingElement.textContent === 'string' ? TextUtility.safeTrim(headingElement.textContent) : '';
      const nextElementSiblingText: string = typeof nextElementSibling.textContent === 'string' ? TextUtility.safeTrim(nextElementSibling.textContent) : '';

      if (TextUtility.areStringsTheSame(headingText, nextElementSiblingText) === false) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('headings_sibling_unique_report_message', [headingElement.nodeName.toLowerCase(), nextElementSibling.textContent]),
        node: headingElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    headings.forEach(checkForSiblings);
  }
}
