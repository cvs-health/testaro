import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class NoMetaHttpEquivRefresh extends AbstractRule {
  protected selector: string = 'meta';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.no_meta_http_equiv_refresh),
    links: [
      {
        content: 'F41: Failure of Success Criterion 2.2.1, 2.2.4, and 3.2.5 due to using meta refresh to reload the page',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/F41.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(htmlMetaElements: HTMLMetaElement[]): void {
    const checkForHttpEquiv = (htmlMetaElement: HTMLMetaElement): void => {
      const metaHttpEquivValue: string | null = htmlMetaElement.getAttribute('http-equiv');

      if (metaHttpEquivValue === null) {
        return;
      }

      if (metaHttpEquivValue === 'refresh' || metaHttpEquivValue === 'Refresh') {
        const report: IIssueReport = {
          message: TranslateService.instant('no_meta_http_equiv_refresh_report_message'),
          node: htmlMetaElement,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    htmlMetaElements.forEach(checkForHttpEquiv);
  }
}
