import { TextUtility } from '../../../utils/text';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { TranslateService } from '../../../services/translate';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class ContentinfoLandmarkOnlyOne extends AbstractRule {
  protected selector: string = '[role="contentinfo"]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.contentinfo_landmark_only_one),
    links: [
      {
        content: 'ARIA11: Using ARIA landmarks to identify regions of a page',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/ARIA11'
      },
      {
        content: 'Accessible Rich Internet Applications (WAI-ARIA) 1.0 Specification: contentinfo role',
        url: 'https://www.w3.org/TR/wai-aria/#contentinfo'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(nodes: Element[]): void {
    const total: number = nodes.length;

    if (total > 1) {
      nodes.forEach((element: Element): void => {
        const reportMessage: string = TranslateService.instant('contentinfo_landmark_only_one_report_message', [TextUtility.escape('role="contentinfo"'), total, '.']);

        const report: IIssueReport = {
          message: reportMessage,
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      });
    }
  }
}
