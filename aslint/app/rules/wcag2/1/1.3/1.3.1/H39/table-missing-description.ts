import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class TableMissingDescription extends AbstractRule {
  protected selector: string = 'table';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.table_missing_description),
    links: [
      {
        content: 'H39: Using caption elements to associate data table captions with data tables',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/H39'
      },
      {
        content: 'Tables > Caption & Summary',
        url: 'http://www.w3.org/WAI/tutorials/tables/caption-summary/'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(tables: HTMLTableElement[]): void {
    const reportCaption = (table: HTMLTableElement): void => {
      const captionElement: HTMLTableCaptionElement | null = table.querySelector('caption');
      const ariaLabelledBy: string | null = table.getAttribute('aria-labelledby');
      const ariaDescribedBy: string | null = table.getAttribute('aria-describedby');
      const summaryAttr: string | null = table.getAttribute('summary');
      const reportMessage: string[] = [];
      let ids: string[];
      let missingAssociatedElements: string[];

      if (captionElement !== null) {
        const captionText: string | null = captionElement.textContent;

        if (typeof captionText === 'string' && TextUtility.safeTrim(captionText).length === 0 || captionText === null) {
          reportMessage.push(TranslateService.instant('table_missing_description_report_message_5', [captionElement.textContent]));
        } else {
          return;
        }
      }

      if (typeof summaryAttr === 'string') {
        if (TextUtility.safeTrim(summaryAttr).length === 0) {
          reportMessage.push(TranslateService.instant('table_missing_description_report_message_3', [`summary="${summaryAttr}"`]));
        } else {
          return;
        }
      }

      if (ariaLabelledBy !== null) {
        if (TextUtility.safeTrim(ariaLabelledBy).length === 0) {
          reportMessage.push(TranslateService.instant('table_missing_description_report_message_4', ['aria-labelledby']));
        } else {
          ids = ariaLabelledBy.split(/\s+/);

          const existingElements = (elementId: string): boolean => {
            return document.getElementById(elementId) === null;
          };

          missingAssociatedElements = ids.filter(existingElements);

          if (missingAssociatedElements.length > 0) {
            reportMessage.push(TranslateService.instant('table_missing_description_report_message_1', ['aria-labelledby', missingAssociatedElements.join(', ')]));
          }
        }
      } else if (ariaDescribedBy !== null) {
        if (TextUtility.safeTrim(ariaDescribedBy).length === 0) {
          reportMessage.push(TranslateService.instant('table_missing_description_report_message_4', ['aria-describedby']));
        } else {
          ids = ariaDescribedBy.split(' ');

          const existingElements = (elementId: string): boolean => {
            return document.getElementById(elementId) === null;
          };

          missingAssociatedElements = ids.filter(existingElements);

          if (missingAssociatedElements.length > 0) {
            reportMessage.push(TranslateService.instant('table_missing_description_report_message_1', ['aria-describedby', missingAssociatedElements.join(', ')]));
          }
        }
      }

      if (reportMessage.length === 0) {
        if (captionElement === null && ariaLabelledBy === null && ariaDescribedBy === null) {
          reportMessage.push(TranslateService.instant('table_missing_description_report_message_2'));
        } else {
          return;
        }
      }

      const report: IIssueReport = {
        message: reportMessage.join(' '),
        node: table,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    tables.forEach(reportCaption);
  }
}
