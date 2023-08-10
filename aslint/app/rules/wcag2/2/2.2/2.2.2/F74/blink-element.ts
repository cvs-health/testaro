import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $auditRuleNodeSkipReason, $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
import { Config } from '../../../../../../config';
import { $runnerSettings } from '../../../../../../constants/aslint';

export class BlinkElement extends AbstractRule {
  private appConfig: Config = Config.getInstance();

  protected selector: string = 'blink';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.blink_element),
    links: [
      {
        content: 'Pause, Stop, Hide',
        url: 'https://www.w3.org/TR/2016/NOTE-UNDERSTANDING-WCAG20-20161007/time-limits-pause.html'
      },
      {
        content: 'F47: Failure of Success Criterion 2.2.2 due to using the blink element',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/F47.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {
    const includeHidden: boolean = this.appConfig.get($runnerSettings.includeHidden);

    const reportNode = (element: Element): void => {
      const report: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      if (includeHidden === false && (DomUtility.isElementVisible(element) === false || DomUtility.isHiddenByParent(element))) {
        report.message = TranslateService.instant('skip_reason_hidden_option');
        report.skipReason = $auditRuleNodeSkipReason.excludedFromScanning;
      } else if (DomUtility.isElementVisible(element) === false || DomUtility.isHiddenByParent(element)) {
        report.message = TranslateService.instant('blink_element_report_message_2', [DomUtility.getEscapedNodeHTML(element)]);
        report.skipReason = $auditRuleNodeSkipReason.excludedFromScanning;
      } else {
        report.message = TranslateService.instant('blink_element_report_message_1', [DomUtility.getEscapedNodeHTML(element)]);
      }

      this.validator.report(report);
    };

    elements.forEach(reportNode);
  }
}
