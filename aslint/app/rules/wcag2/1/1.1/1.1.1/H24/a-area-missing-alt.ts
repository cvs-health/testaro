import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class AreaMissingAlt extends AbstractRule {
  protected selector: string = 'area';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.area_missing_alt),
    links: [
      {
        content: 'H24: Providing text alternatives for the <code>area</code> elements of image maps',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H24.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(areaElements: HTMLAreaElement[]): void {
    const reportNode = (areaElement: HTMLAreaElement): void => {
      let message: string;
      const altContent: string | null = areaElement.getAttribute('alt');

      const altContentLength: number = typeof altContent === 'string' ? altContent.length : 0;
      const altContentTrimLength: number = typeof altContent === 'string' ? altContent.trim().length : 0;

      if (typeof altContent === 'string' && altContentTrimLength > 0) {
        return;
      }

      if (altContent === null) {
        message = TranslateService.instant('area_missing_alt_report_message_1');
      } else if (altContentLength === 0) {
        message = TranslateService.instant('area_missing_alt_report_message_2');
      } else if (altContentTrimLength === 0) {
        message = TranslateService.instant('area_missing_alt_report_message_3');
      }

      const report: IIssueReport = {
        message: message!,
        node: areaElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    areaElements.forEach(reportNode);
  }
}
