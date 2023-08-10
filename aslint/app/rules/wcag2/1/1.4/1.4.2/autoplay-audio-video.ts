import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../utils/text';
import { TranslateService } from '../../../../../services/translate';
import { $severity } from '../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';

export class AutoplayAudioVideo extends AbstractRule {
  protected selector: string = 'iframe[allow*="autoplay=1"], iframe[src*="autoplay=1"], [autoplay]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.autoplay_audio_video),
    links: [
      {
        content: 'Audio Control: Understanding SC 1.4.2',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-dis-audio.html'
      },
      {
        content: 'Pause, Stop, Hide: Understanding SC 2.2.2',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/time-limits-pause.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(mediaElements: (HTMLMediaElement | HTMLIFrameElement)[]): void {
    const reportAutoPlay = (mediaElement: HTMLMediaElement | HTMLIFrameElement): any => {
      const problem: IIssueReport = {
        message: '',
        node: mediaElement,
        ruleId: this.ruleConfig.id
      };

      if (typeof (mediaElement as HTMLMediaElement).autoplay === 'boolean' && (mediaElement as HTMLMediaElement).autoplay) {

        problem.message = TranslateService.instant('autoplay_audio_video_report_message', ['autoplay="true"']);
        this.validator.report(problem);

      } else if (mediaElement.nodeName.toLowerCase() === 'iframe') {
        problem.message = TranslateService.instant('autoplay_audio_video_report_message', [(mediaElement as HTMLIFrameElement).allow]);
        this.validator.report(problem);
      }
    };

    mediaElements.forEach(reportAutoPlay);
  }
}
