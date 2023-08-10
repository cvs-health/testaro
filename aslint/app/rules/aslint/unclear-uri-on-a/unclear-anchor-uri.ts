import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class UnclearAnchorUri extends AbstractRule {
  protected selector: string = 'a[href="#"], a[href*=javascript\\:], a[href=""]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.unclear_anchor_uri),
    links: [
      {
        content: 'Making AJAX applications crawlable',
        url: 'https://developers.google.com/webmasters/ajax-crawling/docs/learn-more#what-the-user-sees-what-the-crawler-sees'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(anchorElements: HTMLAnchorElement[]): void {
    const checkHref = (anchorElement: HTMLAnchorElement): void => {
      const hrefAttr: string | null = anchorElement.getAttribute('href');

      if (hrefAttr === null) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('unclear_uri_on_a_report_message_1', [anchorElement.href]),
        node: anchorElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    const nodesLength: number = anchorElements.length;

    if (nodesLength) {
      anchorElements.forEach(checkHref);
    }
  }
}
