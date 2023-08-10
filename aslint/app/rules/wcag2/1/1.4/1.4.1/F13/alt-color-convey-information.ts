import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { NAMED_COLORS } from '../../../../../../constants/namedColors';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

const reg: RegExp = RegExp(`\\b(${NAMED_COLORS.join('|')})\\b`, 'igm');

export class AltColorConveyInformation extends AbstractRule {
  protected selector: string = '[alt]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.alt_color_convey_information),
    links: [
      {
        content: 'F13: Failure of Success Criterion 1.1.1 and 1.4.1 due to having a text alternative that does not include information that is conveyed by color differences in the image',
        url: 'https://www.w3.org/WAI/GL/2016/WD-WCAG20-TECHS-20160105/F13'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(nodes: Element[]): void {
    const reportNode = (element: Element): void => {
      const altContent: string | null = element.getAttribute('alt');

      if (altContent === null || TextUtility.safeTrim(altContent).length === 0) {
        return;
      }

      const altContentLowerCase: string = altContent.toLowerCase();
      const matches: RegExpMatchArray | null = altContentLowerCase.match(reg);

      if (Array.isArray(matches) && matches.length > 0) {
        const report: IIssueReport = {
          message: TranslateService.instant('alt_color_convey_information_report_message', [matches.join(', ')]),
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    nodes.forEach(reportNode);
  }

}
