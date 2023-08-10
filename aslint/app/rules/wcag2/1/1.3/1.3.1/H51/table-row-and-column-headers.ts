import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class TableRowAndColumnHeaders extends AbstractRule {
  protected selector: string = 'table';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.table_row_and_column_headers),
    links: [
      {
        content: 'H51: Using table markup to present tabular information',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H51.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(tableElements: HTMLTableElement[]): void {
    const reportNode = (tableElement: HTMLTableElement): void => {
      const message: string[] = [];

      if (tableElement.querySelector('th') !== null) {
        return;
      }

      message.push(TranslateService.instant('table_row_and_column_headers_report_message_1', [TextUtility.escape('<th>')]));

      if (tableElement.tBodies.length === 0) {
        message.push(TranslateService.instant('table_row_and_column_headers_report_message_2', [TextUtility.escape('<tbody>')]));
      }

      if (tableElement.tHead === null) {
        message.push(TranslateService.instant('table_row_and_column_headers_report_message_3', [TextUtility.escape('<thead>')]));
      }

      if (message.length === 0) {
        return;
      }

      const report: IIssueReport = {
        message: message.join(' '),
        node: tableElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    tableElements.forEach(reportNode);
  }
}
