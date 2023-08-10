import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
import { DomUtility } from '../../../../../../utils/dom';

export class Flickering extends AbstractRule {
  protected selector: () => HTMLElement[] = (): HTMLElement[] => {
    return [DomUtility.getRootElement()];
  };

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.flickering),
    links: [
      {
        content: 'G19: Ensuring that no component of the content flashes more than three times in any 1-second period',
        url: 'https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/G19'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: HTMLElement[]): void {
    if (elements.length === 0) {
      return;
    }

    const report: IIssueReport = {
      message: TranslateService.instant('flickering_report_message'),
      node: elements[0],
      ruleId: this.ruleConfig.id
    };

    this.validator.report(report);
  }
}
