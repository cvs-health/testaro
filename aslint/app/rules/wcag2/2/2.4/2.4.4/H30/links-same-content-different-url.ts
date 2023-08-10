import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
export class LinksSameContentDifferenceUrl extends AbstractRule {
  protected selector: string = 'body a';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.links_same_content_different_url),
    links: [
      {
        content: 'H30: Providing link text that describes the purpose of a link for anchor elements',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H30.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(nodes: HTMLAnchorElement[]): void {
    const links: HTMLAnchorElement[] = nodes;
    const texts: Map<string, { [url: string]: HTMLAnchorElement }> = new Map();

    const processLink = (anchorElement: HTMLAnchorElement): void => {
      const innerContent: string = DomUtility.getText(anchorElement, true, true);
      let anchors: { [url: string]: HTMLAnchorElement } | undefined = texts.get(innerContent);

      if (typeof anchors === 'undefined') {
        anchors = {};
      }

      anchors[anchorElement.href] = anchorElement;

      texts.set(innerContent, anchors);
    };

    const filterLinks = (anchors: [string, { [url: string]: HTMLAnchorElement }]): void => {
      const urls: string[] = Object.keys(anchors[1]);

      if (urls.length < 2) {
        return;
      }

      const reportIssue = (url: string): void => {
        const report: IIssueReport = {
          message: TranslateService.instant('links_same_content_different_url_report_message'),
          node: anchors[1][url],
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      };

      urls.forEach(reportIssue);
    };

    if (links.length === 0) {
      return;
    }

    links.forEach(processLink);
    Array.from(texts).forEach(filterLinks);
  }
}
