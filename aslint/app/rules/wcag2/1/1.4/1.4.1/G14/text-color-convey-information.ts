import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { NAMED_COLORS } from '../../../../../../constants/namedColors';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

const skipElements: string[] = [
  'body',
  'br',
  'code',
  'defs',
  'desc',
  'filter',
  'g',
  'head',
  'hr',
  'iframe',
  'img',
  'input',
  'linearGradient',
  'link',
  'meta',
  'noscript',
  'object',
  'path',
  'script',
  'stop',
  'style',
  'title'
];

const reg: RegExp = RegExp(`\\b(${NAMED_COLORS.join('|')})\\b`, 'igm');

export class TextColorConveyInformation extends AbstractRule {
  protected selector: string = 'body';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.text_color_convey_information),
    links: [
      {
        content: 'G14: Ensuring that information conveyed by color differences is also available in text',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/G14.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(htmlElements: Element[]): void {
    if (htmlElements.length === 0) {
      return;
    }

    const rootElement: Element = htmlElements[0];
    const nodeIterator: NodeIterator = document.createNodeIterator(
      rootElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node: Node): number {
          return node.nodeType === Node.ELEMENT_NODE && skipElements.includes(node.nodeName.toLowerCase()) || node.nodeType === Node.TEXT_NODE && node.parentNode && skipElements.includes(node.parentNode.nodeName.toLowerCase()) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let textnode: Node | null = nodeIterator.nextNode();

    if (textnode === null) {
      return;
    }

    while (textnode && textnode.textContent) {
      const textContent: string = textnode.textContent.trim();

      if (textContent.length > 0) {
        const matches: RegExpMatchArray | null = textContent.match(reg);

        if (Array.isArray(matches) && matches.length > 0) {
          const report: IIssueReport = {
            message: TranslateService.instant('text_color_convey_information_report_message', [matches.join(', ')]),
            node: textnode.parentElement,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);
        }
      }

      textnode = nodeIterator.nextNode();
    }

  }
}
