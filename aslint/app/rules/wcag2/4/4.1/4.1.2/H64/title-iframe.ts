import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class TitleiFrame extends AbstractRule {
  protected selector: string = 'iframe, object';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.title_iframe),
    links: [
      {
        content: 'H64: Using the <code>title</code> attribute of the <code>frame</code> and <code>iframe</code> elements',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H64.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: HTMLElement[]): void {
    const reportNode = (element: HTMLElement): void => {
      let report: IIssueReport | undefined;
      const titleContent: string | null = element.getAttribute('title');

      if (titleContent === null) {
        report = {
          message: TranslateService.instant('title_iframe_report_message_1', [TextUtility.escape(element.nodeName.toLowerCase())]),
          node: element,
          ruleId: this.ruleConfig.id
        };
      } else {
        const titleContentLength: number = TextUtility.safeTrim(titleContent).length;

        if (titleContentLength === 0) {
          report = {
            message: TranslateService.instant('title_iframe_report_message_2', [TextUtility.escape(element.nodeName.toLowerCase())]),
            node: element,
            ruleId: this.ruleConfig.id
          };
        }
      }

      if (typeof report === 'undefined') {
        return;
      }

      this.validator.report(report);
    };

    elements.forEach(reportNode);
  }
}
