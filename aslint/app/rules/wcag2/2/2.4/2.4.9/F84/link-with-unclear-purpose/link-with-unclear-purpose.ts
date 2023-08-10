import { DomUtility } from '../../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../../constants/categoryType';
import { UNCLEAR_LINK_PHRASES_ENGLISH } from '../../../../../../../constants/unclearLinkPhrases';
import { IIssueReport } from '../../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../../utils/text';
import { TranslateService } from '../../../../../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../../abstract-rule';

export class LinkWithUnclearPurpose extends AbstractRule {
  protected selector: string = 'a:not(:empty)';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.link_with_unclear_purpose),
    links: [
      {
        content: 'G53: Identifying the purpose of a link using link text combined with the text of the enclosing sentence',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/G53.html'
      },
      {
        content: 'G91: Providing link text that describes the purpose of a link',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/G91.html'
      },
      {
        content: 'Understanding Success Criterion 2.4.9: Link Purpose (Link Only)',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-link-only'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_AAA
  };

  public validate(elements: HTMLElement[]): void {
    const processNode = (element: HTMLElement): void => {
      let text: string = DomUtility.getText(element, true)
        .toLowerCase();

      if (text.length === 0) {
        return;
      }

      text = TextUtility.normalizeWhitespaces(text);

      const index: number = UNCLEAR_LINK_PHRASES_ENGLISH.indexOf(text);

      if (index === -1) {
        return;
      }

      const nodeName: string = element.nodeName.toLowerCase();

      const report: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      if (nodeName === 'a') {
        report.message = TranslateService.instant('link_with_unclear_purpose_report_message1', [text]);
      } else if (UNCLEAR_LINK_PHRASES_ENGLISH[index].length === text.length) {
        report.message = TranslateService.instant('link_with_unclear_purpose_report_message2', [text]);
      }

      if (report.message.length === 0) {
        return;
      }

      this.validator.report(report);
    };

    if (elements.length === 0) {
      return;
    }

    elements.forEach(processNode);
  }
}
