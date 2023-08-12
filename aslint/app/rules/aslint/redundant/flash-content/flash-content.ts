import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class FlashContent extends AbstractRule {
  protected selector: string = '[classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"], embed[type="application/x-shockwave-flash"], object[type="application/x-shockwave-flash"]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.flash_content),
    links: [],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    const reportFlash = (element: Element): void => {
      const problem: IIssueReport = {
        message: TranslateService.instant('flash_content_report_message'),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(problem);
    };

    elements.forEach(reportFlash);
  }
}
