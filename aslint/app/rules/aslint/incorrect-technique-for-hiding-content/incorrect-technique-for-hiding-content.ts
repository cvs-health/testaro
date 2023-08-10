import { Css } from '../../../utils/css';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';
import { DomUtility } from '../../../utils/dom';
import { ObjectUtility } from '../../../utils/object';

export class IncorrectTechniqueForHidingContent extends AbstractRule {
  protected selector: string = `*${[
    ':root',
    'head',
    'title',
    'style',
    'script',
    'noscript',
    'meta',
    'link',
    'br',
    'hr',
    'object',
    'path',
    'g',
    'desc',
    'filter',
    'img',
    'input',
    'iframe',
    'code',
    'defs',
    ':empty'
  ].map((i: string): string => {
    return `:not(${i})`;
  }).join('')}`;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.incorrect_technique_for_hiding_content),
    links: [
      {
        content: 'Hiding Content for Accessibility',
        url: 'https://snook.ca/archives/html_and_css/hiding-content-for-accessibility'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {

    if (ObjectUtility.isHostMethod(document, 'getSelection') === false && ObjectUtility.isHostMethod(document, 'createRange') === false) {
      return;
    }

    const reportNode = (element: HTMLElement): void => {
      const styles: CSSStyleDeclaration | null = Css.getComputedStyle(element);

      if (styles === null) {
        return;
      }

      const textIndentValue: string = styles.getPropertyValue('text-indent');
      const indent: number = Number(textIndentValue.replace(/[^0-9]/g, ''));

      if (indent === 0) {
        return;
      }

      const selection: Selection | null = document.getSelection();

      if (selection === null) {
        return;
      }

      const range: Range = document.createRange();

      range.selectNodeContents(element);

      selection.removeAllRanges();
      selection.addRange(range);

      for (let i: number = 0; i < selection.rangeCount; i += 1) {
        if (DomUtility.isRangeOffPage(selection.getRangeAt(i))) {
          const reportMessage: string = TranslateService.instant('incorrect_technique_for_hiding_content_report_message', [textIndentValue]);

          const report: IIssueReport = {
            message: reportMessage,
            node: element,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);

          return;
        }
      }
    };

    elements.forEach(reportNode);
  }
}
