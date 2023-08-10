import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class ImgEmptyAltInLink extends AbstractRule {
  protected selector: string = 'a img';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.img_empty_alt_in_link),
    links: [
      {
        content: 'H30: Providing link text that describes the purpose of a link for anchor elements',
        url: 'https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/H30'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(nodes: HTMLImageElement[]): void {
    const reportNode = (node: HTMLImageElement): void => {
      let report: IIssueReport | undefined;

      const nodeToReport: HTMLElement | null = DomUtility.getParentElement(node, 'a');
      const altAttribute: string | null = node.getAttribute('alt');

      if (nodeToReport === null || altAttribute === null) {
        return;
      }

      const nodeText: string | null = nodeToReport.textContent;

      if (nodeText === null || typeof nodeText === 'string' && nodeText.trim().length > 0) {
        return;
      }

      const altContentLength: number = altAttribute.length;
      const altContentTrimLength: number = altAttribute.trim().length;

      if (typeof altAttribute === 'string') {

        if (altContentLength === 0) {
          report = {
            message: TranslateService.instant('img_empty_alt_in_link_report_message_1'),
            node: nodeToReport,
            ruleId: this.ruleConfig.id
          };
        } else if (altContentTrimLength === 0) {
          report = {
            message: TranslateService.instant('img_empty_alt_in_link_report_message_2'),
            node: nodeToReport,
            ruleId: this.ruleConfig.id
          };
        }

        if (typeof report === 'undefined') {
          return;
        }

        this.validator.report(report);
      }
    };

    nodes.forEach(reportNode);
  }
}
