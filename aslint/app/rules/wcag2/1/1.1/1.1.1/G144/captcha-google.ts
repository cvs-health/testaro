import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { ObjectUtility } from '../../../../../../utils/object';
import { Global } from '../../../../../../utils/global';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class CaptchaGoogle extends AbstractRule {
  protected selector: string = 'iframe[src^="https://www.google.com/recaptcha/api2"]:not([title])';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.captcha_google),
    links: [
      {
        content: 'G144: Ensuring that the Web Page contains another CAPTCHA serving the same purpose using a different modality',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/G144.html'
      },
      {
        content: 'Inaccessibility of CAPTCHA',
        url: 'http://www.w3.org/TR/turingtest/'
      },
      {
        content: 'Note on CAPTCHA',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/complete.html#text-equiv-all-9-head'
      },
      {
        content: 'Captcha Alternatives and thoughts',
        url: 'https://www.w3.org/WAI/GL/wiki/Captcha_Alternatives_and_thoughts'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(iFrameElements: HTMLIFrameElement[]): void {
    const reportNode = (iFrameElement: HTMLIFrameElement): void => {
      const report: IIssueReport = {
        message: TranslateService.instant('captcha_google_link_report_message'),
        node: iFrameElement,
        ruleId: this.ruleConfig.id
      };

      try {
        if (ObjectUtility.getTypeOf(Global.context.grecaptcha) === 'object') {
          // Note: reCAPTCHA V2 would return a string, reCAPTCHA V3 would throw an error
          const res: string = Global.context.grecaptcha.getResponse();
          const isReCaptchaV2: boolean = typeof res === 'string';

          if (isReCaptchaV2) {
            this.validator.report(report);
          }
        }
      } catch (e) {
        // ignored
      }
    };

    iFrameElements.forEach(reportNode);
  }
}
