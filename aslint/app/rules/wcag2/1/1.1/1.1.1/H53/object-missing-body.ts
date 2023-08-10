import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class ObjectMissingBody extends AbstractRule {
  protected selector: string = 'object';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.object_missing_body),
    links: [
      {
        content: '§ 1194.22 (a) A text equivalent for every non-text element shall be provided (e.g., via "alt", "longdesc", or in element content).',
        url: 'https://www.access-board.gov/guidelines-and-standards/communications-and-it/about-the-section-508-standards/section-508-standards'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(objectElements: HTMLObjectElement[]): void {
    const reportNode = (objectElement: HTMLObjectElement): void => {
      const textContent: string = DomUtility.nodesToText(objectElement);
      const textContentTrimLength: number = TextUtility.trim(textContent).length;
      const textContentLength: number = TextUtility.trim(textContent).length;
      let message: string;

      if (textContentTrimLength > 0) {
        return;
      }

      if (textContentLength > 0) {
        message = TranslateService.instant('object_missing_body_report_message_1', [TextUtility.escape('<object>'), TextUtility.escape('<object>')]);
      } else {
        message = TranslateService.instant('object_missing_body_report_message_2', [TextUtility.escape('<object>'), TextUtility.escape('<object>'), TextUtility.escape('<object>')]);
      }

      const report: IIssueReport = {
        message: message,
        node: objectElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    objectElements.forEach(reportNode);
  }
}
