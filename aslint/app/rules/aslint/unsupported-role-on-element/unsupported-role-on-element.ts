import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { TAG_TO_IMPLICIT_SEMANTIC_INFO } from '../../../constants/aria';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class UnsupportedRoleOnElement extends AbstractRule {
  protected selector: string = 'a[href="#"], a[href*=javascript\\:], a[href=""]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.unsupported_role_on_element),
    links: [],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(anchorElements: HTMLAnchorElement[]): void {
    const checkSingleNode = (anchorElement: HTMLAnchorElement): void => {
      const tagName: string = anchorElement.nodeName.toUpperCase();
      const roleValue: string | null = anchorElement.getAttribute('role');

      if (typeof TAG_TO_IMPLICIT_SEMANTIC_INFO[tagName] === 'undefined') {
        return;
      }

      if (roleValue === null) {
        return;
      }

      if (
        Array.isArray(TAG_TO_IMPLICIT_SEMANTIC_INFO[tagName][0].allowed) &&
        (TAG_TO_IMPLICIT_SEMANTIC_INFO[tagName][0].allowed as string[]).indexOf(
          roleValue
        ) !== -1
      ) {
        return;
      }

      const reportMessage: string = TranslateService.instant(
        'unsupported_role_on_element_report_message',
        [roleValue]
      );

      const report: IIssueReport = {
        message: reportMessage,
        node: anchorElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    const nodesLength: number = anchorElements.length;

    if (nodesLength > 0) {
      anchorElements.forEach(checkSingleNode);
    }
  }
}
