import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class TableCaptionSummaryIdentical extends AbstractRule {
  protected selector: string = 'table[summary]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.table_caption_summary_identical),
    links: [
      {
        content: 'H39: Using caption elements to associate data table captions with data tables',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H39.html'
      },
      {
        content: 'H73: Using the summary attribute of the table element to give an overview of data tables',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H73.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(tables: HTMLTableElement[]): void {
    const reportNode = (table: HTMLTableElement): void => {
      const summaryText: string | null = table.getAttribute('summary');
      const captionElement: HTMLTableCaptionElement | null = table.querySelector('caption');

      if (captionElement === null) {
        return;
      }

      const captionText: string | null = captionElement.textContent;

      if (summaryText !== captionText) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('table_caption_summary_identical_report_message', [TextUtility.escape('<caption>')]),
        node: table,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    tables.forEach(reportNode);
  }
}
