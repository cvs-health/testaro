import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class AppletMissingBody extends AbstractRule {
  protected selector: string = 'applet';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.applet_missing_body),
    links: [
      {
        content: 'H35: Providing text alternatives on <code>applet</code> elements',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H35.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const reportNode = (element: Element): void => {
      let message: string;
      const textContent: string = DomUtility.nodesToText(element);
      const textContentTrimLength: number = TextUtility.trim(textContent).length;
      const textContentLength: number = textContent.length;

      if (textContentTrimLength > 0) {
        return;
      }

      if (textContentLength > 0) {
        message = TranslateService.instant('applet_missing_body_report_message_1', [TextUtility.escape('<applet>'), TextUtility.escape('<applet>')]);
      } else {
        message = TranslateService.instant('applet_missing_body_report_message_2', [TextUtility.escape('<applet>'), TextUtility.escape('<applet>'), TextUtility.escape('<applet>')]);
      }

      const report: IIssueReport = {
        message: message,
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(reportNode);
  }
}
