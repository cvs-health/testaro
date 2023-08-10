import { $accessibilityAuditRules, $severity } from '../../../../../../constants/accessibility';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { DomUtility } from '../../../../../../utils/dom';
import { ObjectUtility } from '../../../../../../utils/object';
import { TextUtility } from '../../../../../../utils/text';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class MotionActuation extends AbstractRule {
  protected selector: () => HTMLElement[] = (): HTMLElement[] => {
    return [DomUtility.getRootElement()];
  }

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.motion_actuation),
    links: [
      {
        content: 'Provide conventional controls and an application setting for motion activated input',
        url: 'https://www.w3.org/WAI/WCAG21/Techniques/general/G213.html'
      },
      {
        content: 'Understanding Success Criterion 2.5.4: Motion Actuation',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/motion-actuation.html'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: Element[]): void {

    const validateElement = (element: Element): void => {
      const isDeviceOrientationApiAvailable: boolean = ObjectUtility.isHostMethod(window, 'DeviceMotionEvent') && ObjectUtility.isHostMethod(window, 'DeviceOrientationEvent');

      const problem: IIssueReport = {
        message: TranslateService.instant('motion_actuation_report_message_1', [String(isDeviceOrientationApiAvailable)]),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(problem);
    };

    elements.forEach(validateElement);
  }
}
