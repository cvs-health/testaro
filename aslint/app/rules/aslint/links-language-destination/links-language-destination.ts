import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class LinksLanguageDestination extends AbstractRule {
  protected selector: () => (HTMLAnchorElement | HTMLAreaElement)[] = (): (HTMLAnchorElement | HTMLAreaElement)[] => {
    return Array.from(document.links);
  };

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.links_language_destination),
    links: [
      {
        content: 'Indicating the language of a link destination',
        url: 'https://www.w3.org/International/questions/qa-link-lang'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(links: (HTMLAnchorElement | HTMLAreaElement)[]): void {
    let baseURI: string;

    if (typeof document.baseURI === 'string') {
      baseURI = document.baseURI;
    } else {
      baseURI = document.URL || document.location.href;
    }

    const onlyIncludeExternalLinks = (link: HTMLAnchorElement | HTMLAreaElement): boolean => {
      if (link.hostname.length > 0 && link.href.length > 0) {
        let baseHostname: string;

        try {
          const url: URL = new URL(link.href, baseURI);

          baseHostname = url.hostname;
        } catch (_) {
          baseHostname = document.location.hostname;
        }

        return baseHostname !== window.location.hostname;
      }

      return false;
    };

    const externalLinks: (HTMLAnchorElement | HTMLAreaElement)[] = links.filter(onlyIncludeExternalLinks);

    const reportIssue = (anchorElement: (HTMLAnchorElement | HTMLAreaElement)): void => {
      const reportMessage: string = TranslateService.instant('links_language_destination_report_message', [TextUtility.escape(anchorElement.href)]);

      const report: IIssueReport = {
        message: reportMessage,
        node: anchorElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    externalLinks.forEach(reportIssue);
  }
}
