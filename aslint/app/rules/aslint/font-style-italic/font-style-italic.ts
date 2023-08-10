import { DomUtility } from '../../../utils/dom';
import { Css } from '../../../utils/css';
import { TextUtility } from '../../../utils/text';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class FontStyleItalic extends AbstractRule {

  protected selector: string = `*${[
    ':root',
    'head',
    'style',
    'script',
    'noscript',
    'meta',
    'link',
    'br',
    'hr',
    'object',
    'svg',
    'path',
    'defs',
    'rect',
    'clippath',
    'use',
    'g',
    'b',
    'filter',
    'img',
    'picture',
    'input',
    'iframe',
    'code',
    'metadata',
    ':empty'
  ].map((i: string): string => {
    return `:not(${i})`;
  }).join('')}`;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.font_style_italic),
    links: [
      {
        content: 'Avoiding chunks of italic text',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {
    const reportNode = (element: HTMLElement): void => {
      let isItalic: boolean = false;
      const textContent: string = DomUtility.getTextFromDescendantContent(element).trim();
      const textContentLength: number = textContent.length;
      const REASONABLE_LONG_TEXT: number = 80;

      // Note: element.style may not exists, e.g. for an element in a different namespace
      if (Css.getStyle(element, 'font-style') === 'italic' || typeof element.style === 'object' && element.style.fontStyle === 'italic') {
        isItalic = true;
      }

      if (isItalic === false || textContentLength < REASONABLE_LONG_TEXT) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('font_style_italic_report_message', [textContentLength]),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(reportNode);
  }
}
