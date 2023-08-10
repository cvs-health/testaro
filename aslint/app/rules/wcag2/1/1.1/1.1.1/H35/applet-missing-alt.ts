import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class AppletMissingAlt extends AbstractRule {
  protected selector: string = 'applet';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.applet_missing_alt),
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

  public validate(appletElements: HTMLAppletElement[]): void {
    const reportNode = (appletElement: HTMLAppletElement): void => {
      let message: string = '';
      const altContent: string | null = appletElement.getAttribute('alt');
      const altContentLength: number = typeof altContent === 'string' ? altContent.length : 0;
      const altContentTrimLength: number = typeof altContent === 'string'? altContent.trim().length : 0;

      if (typeof altContent === 'string' && altContentTrimLength > 0) {
        return;
      }

      if (altContent === null) {
        message = TranslateService.instant('applet_missing_alt_report_message_1');
      } else if (altContentLength === 0) {
        message = TranslateService.instant('applet_missing_alt_report_message_2');
      } else if (altContentTrimLength === 0) {
        message = TranslateService.instant('applet_missing_alt_report_message_3');
      }

      const report: IIssueReport = {
        message: message,
        node: appletElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    appletElements.forEach(reportNode);
  }
}
