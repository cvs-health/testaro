import { DomUtility } from '../../../../../../utils/dom';
import { ObjectUtility } from '../../../../../../utils/object';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class AudioAlternative extends AbstractRule {
  protected selector: string = 'bgsound, audio, object';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.audio_alternative),
    links: [
      {
        content: 'G158: Providing an alternative for time-based media for audio-only content',
        url: 'https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/G158'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: HTMLElement[]): void {
    const reportNode = (element: HTMLElement): void => {
      const nodeName: string = element.nodeName.toLowerCase();
      let message: string = TranslateService.instant('audio_alternative_report_message_1');

      if (nodeName === 'audio' && DomUtility.querySelectorAll('track', element).length === 0) {
        message += TranslateService.instant('audio_alternative_report_message_2');
      } else if (nodeName === 'bgsound') {
        message += TranslateService.instant('audio_alternative_report_message_3');
      } else if (nodeName === 'object') {
        message += TranslateService.instant('audio_alternative_report_message_4');
      }

      const report: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(ObjectUtility.extend(report, {
        message: message
      }));
    };

    elements.forEach(reportNode);
  }
}
