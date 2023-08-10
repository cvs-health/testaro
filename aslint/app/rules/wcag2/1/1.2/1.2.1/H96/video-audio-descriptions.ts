import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class VideoAudioDescriptions extends AbstractRule {
  protected selector: string = 'video';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.video_audio_descriptions),
    links: [
      {
        content: 'H96: Using the track element to provide audio descriptions',
        url: 'https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/H96.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(videoElements: HTMLVideoElement[]): void {
    const reportNode = (videoElement: HTMLVideoElement): void => {
      const nodeAudioSources: NodeListOf<HTMLSourceElement> = videoElement.querySelectorAll('source[type^="audio/"]');
      const nodeTrackDescriptions: NodeListOf<HTMLTrackElement> = videoElement.querySelectorAll('track[kind="descriptions"]');

      if (nodeAudioSources.length === 0 && nodeTrackDescriptions.length === 0) {
        const report: IIssueReport = {
          message: TranslateService.instant('video_audio_descriptions_report_message', [TextUtility.escape('<track>'), TextUtility.escape('<source>')]),
          node: videoElement,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    videoElements.forEach(reportNode);
  }
}
