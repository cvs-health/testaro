import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class ZoomDisabled extends AbstractRule {
  protected selector: string = 'meta';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.zoom_disabled),
    links: [
      {
        content: 'G142: Using a technology that has commonly-available user agents that support zoom',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/G142.html'
      },
      {
        content: 'Resize text: Understanding Success Criterion 1.4.4',
        url: 'http://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-scale.html'
      }
    ],
    recommendations: [],
    severity: $severity.critical,
    type: CATEGORY_TYPE.WCAG_AA
  };

  public validate(metaElements: HTMLMetaElement[]): void {
    const checkForUserScalable = (metaElement: HTMLMetaElement): void => {
      const parameters: string[] = [];

      if ((/user-scalable\s*=\s*no/).test(metaElement.content)) {
        parameters.push('user-scalable=no');
      }

      if ((/user-scalable\s*=\s*0/).test(metaElement.content)) {
        parameters.push('user-scalable=0');
      }

      if ((/maximum-scale/).test(metaElement.content)) {
        parameters.push('maximum-scale');
      }

      if ((/minimum-scale/).test(metaElement.content)) {
        parameters.push('minimum-scale');
      }

      if (parameters.length === 0) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('zoom_disabled_report_message', [parameters.join(', ')]),
        node: metaElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    metaElements.forEach(checkForUserScalable);
  }
}
