import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
import { DomUtility } from '../../../../../../utils/dom';

export class PageTitle extends AbstractRule {
  protected selector: () => HTMLElement[] = (): HTMLElement[] => {
    return [DomUtility.getRootElement()];
  };

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.page_title),
    links: [
      {
        content: 'F25: Failure of Success Criterion 2.4.2 due to the title of a Web page not identifying the contents',
        url: 'https://www.w3.org/WAI/GL/2016/WD-WCAG20-TECHS-20160105/F25'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const titleElement: HTMLTitleElement | null = elements[0].querySelector('head title');

    if (titleElement === null) {
      return;
    }

    const pageTitle: string | null = titleElement.textContent;

    if (pageTitle === null) {
      return;
    }

    const unclearTitle: string[] = [
      'Enter the title of your HTML document here',
      'Untitled Document',
      'No Title',
      'Untitled Page',
      'New Page 1'
    ];

    const report: IIssueReport = {
      message: '',
      node: titleElement,
      ruleId: this.ruleConfig.id
    };

    if (TextUtility.safeTrim(pageTitle).length === 0) {
      report.message = TranslateService.instant('title_element_report_message_2');
    } else if (unclearTitle.includes(pageTitle)) {
      report.message = TranslateService.instant('title_element_report_message_1', [pageTitle]);
    }

    if (report.message.length === 0) {
      return;
    }

    this.validator.report(report);
  }
}
