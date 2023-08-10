import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class AriaDescribedbyAssociation extends AbstractRule {
  protected selector: string = 'iframe';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.aria_describedby_association),
    links: [
      {
        content: 'ARIA1: Using the aria-describedby property to provide a descriptive label for user interface controls',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/ARIA1.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(iframeElements: HTMLIFrameElement[]): void {
    const checkAssociations = (iframeElement: HTMLIFrameElement): any => {
      let idReferences: string | null = iframeElement.getAttribute('aria-describedby');

      if (idReferences === null) {
        return;
      }

      let ids: string[];

      const isElementExists = (id: string): void => {
        const refNode: HTMLElement | null = document.getElementById(id);

        if (refNode === null) {
          const report: IIssueReport = {
            message: TranslateService.instant('aria_describedby_association_report_message_1', [id, id]),
            node: iframeElement,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);
        }
      };

      idReferences = idReferences.trim();

      if (idReferences.length === 0) {
        const report: IIssueReport = {
          message: TranslateService.instant('aria_describedby_association_report_message_2', [DomUtility.getEscapedOuterHTML(iframeElement)]),
          node: iframeElement,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      } else {
        ids = idReferences.split(/ +/).map(Function.prototype.call, String.prototype.trim);
        ids.forEach(isElementExists);
      }
    };

    iframeElements.forEach(checkAssociations);
  }
}
