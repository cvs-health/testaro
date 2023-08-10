import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class ImgAdjacentDuplicateTextLink extends AbstractRule {
  protected selector: string = 'a';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.img_adjacent_duplicate_text_link),
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
      const report: IIssueReport = {
        message: '',
        node: anchorElement,
        ruleId: this.ruleConfig.id
      };

      let nextElemSibling: Element | null = anchorElement.nextElementSibling;
      let textInBetween: string = '';

      while (nextElemSibling && nextElemSibling.nodeName.toLowerCase() !== 'a') {
        textInBetween += DomUtility.getText(nextElemSibling).trim();
        nextElemSibling = nextElemSibling.nextElementSibling;
      }

      if (nextElemSibling && textInBetween.length === 0) {
        const currNodeImgChildren: HTMLElement[] = DomUtility.querySelectorAll('img', anchorElement);
        const nextNodeImgChildren: HTMLElement[] = DomUtility.querySelectorAll('img', nextElemSibling);
        let nodeWithIcon: Element | null;

        if (currNodeImgChildren.length === nextNodeImgChildren.length || currNodeImgChildren.length !== 1 && nextNodeImgChildren.length !== 1) {
          nodeWithIcon = null;
        } else if (currNodeImgChildren.length === 1) {
          nodeWithIcon = anchorElement;
        } else {
          nodeWithIcon = nextElemSibling;
        }

        let nodeWithText: Element = anchorElement;

        if (nodeWithIcon === null) {
          nodeWithText = anchorElement;
        } else if (nodeWithIcon === anchorElement) {
          nodeWithText = nextElemSibling;
        }

        report.node = anchorElement;

        if (nodeWithIcon && nodeWithText && (nodeWithIcon as HTMLElement).getAttribute('href') === nodeWithText.getAttribute('href')) {
          const nodeWithTextContent: string = DomUtility.getText(nodeWithText).replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

          const nodeWithIconContent: string = DomUtility.getText(nodeWithIcon).replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
          const nodeWithIconAltText: string = (DomUtility.querySelectorAll('img', nodeWithIcon)[0].getAttribute('alt') || '').trim().toLowerCase();

          if (nodeWithIconContent.length === 0 && nodeWithIconAltText && nodeWithTextContent === nodeWithIconAltText) {
            report.message = TranslateService.instant('img_adjacent_duplicate_text_link_report_message_1');
          } else if (nodeWithIconContent.length === 0 && nodeWithIconAltText.length === 0) {
            report.message = TranslateService.instant('img_adjacent_duplicate_text_link_report_message_2');
          }
        }
      }

      if (report.message) {
        this.validator.report(report);
      }
    };

    anchorElements.forEach(reportNode);
  }
}
