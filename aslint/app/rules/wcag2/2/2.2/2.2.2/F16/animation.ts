import { DomUtility } from '../../../../../../utils/dom';
import { Css } from '../../../../../../utils/css';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class Animation extends AbstractRule {

  protected selector: string = `*${[
    ':root',
    'head',
    'body',
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
    'linearGradient',
    'stop',
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
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.animation),
    links: [
      {
        content: 'Pause, Stop, Hide',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/time-limits-pause.html'
      },
      {
        content: 'F16: Failure of Success Criterion 2.2.2 due to including scrolling content where movement is not essential to the activity without also including a mechanism to pause and restart the content',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/F16.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(htmlElements: HTMLElement[]): void {
    const ONE_SECOND_IN_MILISECONDS: number = 1000;

    const reportNode = (htmlElement: HTMLElement): any => {
      let duration: string | null = Css.getStyle(htmlElement, 'animation-duration');
      const animationIterationCount: string | null = Css.getStyle(htmlElement, 'animation-iteration-count');

      if (duration === null || animationIterationCount === null) {
        return;
      }

      if ((/\d*\s*(ms)$/).test(duration)) {
        duration = String(Number(duration) / ONE_SECOND_IN_MILISECONDS);
      }

      const report: IIssueReport = {
        message: '',
        node: htmlElement,
        ruleId: this.ruleConfig.id
      };

      const reportMessage: string[] = [];

      if (Number(duration.replace(/[^\d.-]/g, '')) > 5) {
        reportMessage.push(TranslateService.instant('animation_report_message_1', [duration]));
      }

      if (animationIterationCount === 'infinite') {
        reportMessage.push(TranslateService.instant('animation_report_message_2', [animationIterationCount, DomUtility.getEscapedNodeHTML(htmlElement)]));
      }

      if (reportMessage.length === 0) {
        return;
      }

      reportMessage.push(TranslateService.instant('animation_report_message_0'));
      report.message = reportMessage.join(' ');

      this.validator.report(report);
    };

    htmlElements.forEach(reportNode);
  }
}
