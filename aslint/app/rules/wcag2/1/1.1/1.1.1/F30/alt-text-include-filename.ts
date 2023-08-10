import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class AltTextIncludeFilename extends AbstractRule {
  protected selector: string = '[alt]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.alt_text_include_filename),
    links: [
      {
        content: 'F30: Failure of Success Criterion 1.1.1 and 1.2.1 due to using text alternatives that are not alternatives (e.g., filenames or placeholder text)',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/F30'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(htmlElements: Element[]): void {
    const imageExtensions: string[] = [
      'apng',
      'avif',
      'bmp',
      'gif',
      'jpeg',
      'jpg',
      'png',
      'svg',
      'tif',
      'tiff',
      'webp'
    ];

    const reportNode = (htmlElement: Element): void => {

      const altText: string | null = htmlElement.getAttribute('alt');

      if (altText === null || altText.trim().length === 0) {
        return;
      }

      const extension: string | undefined = altText.split('.').pop();

      if (typeof extension === 'undefined') {
        return;
      }

      if (imageExtensions.includes(extension) === false) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('alt_text_include_filename_report_message', altText),
        node: htmlElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    htmlElements.forEach(reportNode);
  }
}
