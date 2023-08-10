import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class LinksNewWindowMark extends AbstractRule {
  protected selector: string = 'a';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.links_new_window_mark),
    links: [
      {
        content: 'G201: Giving users advanced warning when opening a new window',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/G201.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_AAA
  };

  public validate(anchorElements: HTMLAnchorElement[]): void {
    const processAnchorElement = (anchorElement: HTMLAnchorElement): void => {
      if (typeof anchorElement.getAttribute('target') === 'string' && anchorElement.getAttribute('target') === '_blank') {
        const report: IIssueReport = {
          message: TranslateService.instant('links_new_window_mark_report_message'),
          node: anchorElement,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    anchorElements.forEach(processAnchorElement);
  }
}
