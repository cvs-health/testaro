import { DomUtility } from '../../../utils/dom';
import { Css } from '../../../utils/css';
import { TextUtility } from '../../../utils/text';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class CapitalLettersWords extends AbstractRule {
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
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.capital_letters_words),
    links: [
      {
        content: 'Dyslexia Font and Style Guide',
        url: 'https://www.dyslexia-reading-well.com/dyslexia-font.html'
      },
      {
        content: 'Typefaces for dyslexia',
        url: 'https://bdatech.org/what-technology/typefaces-for-dyslexia/'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(nodes: HTMLElement[]): void {
    const onlyWordsWithUpperCases = (word: string): boolean => {
      return TextUtility.isUpperCase(word);
    };

    const processNode = (element: HTMLElement): void => {
      const report: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      let reportMessage: string = '';

      let words: string[];
      let onlyWordsWithUpperCase: string[] = [];

      const text: string = DomUtility.getTextFromDescendantContent(element).trim();

      words = text.split(' ');

      if (text.length > 0 && words.length > 0) {
        if (Css.isCssTextTransformUsed(element)) {
          reportMessage = TranslateService.instant('capital_letters_words_report_message1', [text.toUpperCase()]);
        } else {

          onlyWordsWithUpperCase = words.filter(onlyWordsWithUpperCases);

          if (onlyWordsWithUpperCase.length > 1) {
            reportMessage = TranslateService.instant('capital_letters_words_report_message2');
          }
        }
      }

      const titleAttribute: string | null = element.getAttribute('title');

      if (typeof titleAttribute === 'string' && titleAttribute.trim().length > 0) {
        words = titleAttribute.split(' ');
        onlyWordsWithUpperCase = words.filter(onlyWordsWithUpperCases);

        if (onlyWordsWithUpperCase.length > 1) {
          if (reportMessage.length === 0) {
            reportMessage = TranslateService.instant('capital_letters_words_report_message3', [titleAttribute]);
          } else {
            reportMessage = TranslateService.instant('capital_letters_words_report_message4', [titleAttribute]);
          }
        }
      }

      if (reportMessage.length === 0) {
        return;
      }

      report.message = `${reportMessage} ${TranslateService.instant('capital_letters_words_report_explanation')}`;

      this.validator.report(report);
    };

    nodes.forEach(processNode);
  }
}
