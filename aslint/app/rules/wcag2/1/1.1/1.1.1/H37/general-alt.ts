import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class GeneralAlt extends AbstractRule {
  protected selector: string = '[role="img"][alt], input[type="image"][alt]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.general_alt),
    links: [
      {
        content: 'H37: Using <code>alt</code> attributes on <code>img</code> elements',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H37.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(htmlElements: HTMLElement[]): void {
    const reportNode = (htmlElement: HTMLElement): void => {
      const altContent: string | null = htmlElement.getAttribute('alt');
      const altContentLength: number = typeof altContent === 'string' ? altContent.length : 0;
      const altContentTrimLength: number = typeof altContent === 'string' ? altContent.trim().length : 0;

      if (typeof altContent === 'string' && altContentLength === 0 || altContentTrimLength === 0) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('general_alt_report_message'),
        node: htmlElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    htmlElements.forEach(reportNode);
  }
}
