import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class AudioVideoCaptions extends AbstractRule {
  protected selector: string = 'audio, video';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.audio_video_captions),
    links: [
      {
        content: 'H95: Using the track element to provide captions',
        url: 'https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/H95'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: HTMLElement[]): void {
    const reportNode = (element: HTMLElement): void => {
      const nodeTrackCaptions: NodeListOf<HTMLTrackElement> = element.querySelectorAll('track[kind="captions"]');

      if (nodeTrackCaptions.length > 0) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('audio_video_captions_report_message', [TextUtility.escape('<track>')]),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(reportNode);
  }
}
