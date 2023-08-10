import { $accessibilityAuditRules, $severity } from '../../../../../constants/accessibility';
import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../services/translate';
import { TextUtility } from '../../../../../utils/text';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';


export class BrokenSamePageLink extends AbstractRule {
  protected selector: string = 'a';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.broken_same_page_link),
    links: [
      {
        content: '2.1.1 Keyboard (Level A)',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: HTMLAnchorElement[]): void {
    const reportEmptyLink = (element: HTMLAnchorElement): void => {
      const href: string = element.href;
      let url: URL | null;

      try {
        url = new URL(href);
      } catch (_) {
        url = null;
      }

      if (url === null) {
        return;
      }

      if (url.hostname !== window.location.hostname || url.pathname !== window.location.pathname) {
        return;
      }

      const hash: string | undefined = url.hash.split('#')[1];

      if (url.hash === '#' || typeof hash === 'string' && hash.length > 0 && document.getElementById(hash) === null) {

        const reportIssue: IIssueReport = {
          message: TranslateService.instant('broken_same_page_link_report_message', [hash]),
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(reportIssue);
      }
    };

    elements.forEach(reportEmptyLink);
  }
}
