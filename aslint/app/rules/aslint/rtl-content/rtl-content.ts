import { Css } from '../../../utils/css';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class RtlContent extends AbstractRule {
  protected selector: string = `*${[
    ':root',
    'head',
    'style',
    'script',
    'meta',
    'link',
    'br',
    'hr',
    'object',
    'path',
    'g',
    'filter',
    'img',
    'input',
    'iframe',
    'code',
    ':empty'
  ].map((i: string): string => {
    return `:not(${i})`;
  }).join('')}`;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.rtl_content),
    links: [
      {
        content: 'Right to left implementation tricks',
        url: 'http://www.ctomczyk.pl/right-to-left-implementation-tricks/642/'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): any {
    const nodesToReport: HTMLElement[] = [];

    const reportRTL = (element: HTMLElement): void => {
      if (element.nodeType !== element.ELEMENT_NODE) {
        return;
      }

      const direction: string | null = Css.getStyle(element, 'direction');

      if (typeof direction === 'string' && direction.toLowerCase() === 'rtl') {
        nodesToReport.push(element);
      }
    };

    elements.forEach(reportRTL);

    const createReport = (element: HTMLElement): void => {
      const problem: IIssueReport = {
        message: TranslateService.instant('rtl_content_report_message'),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(problem);
    };

    nodesToReport.forEach(createReport);
  }
}
