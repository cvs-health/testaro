import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
export class ImgAltDuplicateTextLink extends AbstractRule {
  protected selector: string = 'a';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.img_alt_duplicate_text_link),
    links: [
      {
        content: 'H2: Combining adjacent image and text links for the same resource',
        url: 'https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/H2'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(anchorElements: HTMLAnchorElement[]): void {

    const reportNode = (anchorElement: HTMLAnchorElement): void => {
      const nodeTextContent: string = TextUtility.safeTrim(DomUtility.getText(anchorElement, false, false)).toLowerCase();
      const nodeImgChildren: HTMLElement[] = DomUtility.querySelectorAll('img', anchorElement);

      const nodeFirstImgAlt: string | null = nodeImgChildren.length ?
        TextUtility.safeTrim(nodeImgChildren[0].getAttribute('alt') || '').toLowerCase() :
        null;

      if (nodeImgChildren.length === 1 && (nodeTextContent && nodeTextContent === nodeFirstImgAlt)) {
        const report: IIssueReport = {
          message: TranslateService.instant('img_alt_duplicate_text_link_report_message'),
          node: anchorElement,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    anchorElements.forEach(reportNode);
  }
}
