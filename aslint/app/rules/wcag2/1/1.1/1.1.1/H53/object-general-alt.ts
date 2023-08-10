import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class ObjectGeneralAlt extends AbstractRule {
  protected selector: string = 'object';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.object_general_alt),
    links: [],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(objectElements: HTMLObjectElement[]): void {
    const reportNode = (objectElement: HTMLObjectElement): void => {
      const textContent: string = DomUtility.nodesToText(objectElement);
      const textContentLength: number = TextUtility.trim(textContent).length;
      const message: string = TranslateService.instant('object_general_alt_report_message');

      if (textContentLength === 0) {
        return;
      }

      const report: IIssueReport = {
        message: message,
        node: objectElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    objectElements.forEach(reportNode);
  }
}
