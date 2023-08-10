import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';
import { Context } from '../../../interfaces/context.interface';

export class Overlay extends AbstractRule {
  protected selector: string = 'script';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.overlay),
    links: [
      {
        content: 'The Many Pitfalls of Accessibility Overlays',
        url: 'https://www.essentialaccessibility.com/blog/the-many-pitfalls-of-accessibility-overlays'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(scripts: HTMLScriptElement[]): void {
    let foundedInScripts: boolean = false;

    const findByScripts = (_overlayEntries: [string, string[]][]): void => {
      const findOverlay = (script: HTMLScriptElement): void => {

        let url: URL | null;

        if (script.src.length === 0) {
          // Note: this means script is inline embedded
          return;
        }

        try {
          url = new URL(script.src);
        } catch (_) {
          url = null;
        }

        if (url === null) {
          return;
        }

        const hostname: string = url.hostname;
        const foundedOverlays: Map<string, null> = new Map();

        for (const [overlayName, overlayUrls] of _overlayEntries) {

          for (const overlayUrl of overlayUrls) {
            if (hostname.includes(overlayUrl)) {
              foundedOverlays.set(overlayName, null);
            }
          }
        }

        if (Array.from(foundedOverlays).length === 0) {
          return;
        }

        const reportMessage: string = TranslateService.instant('overlay_report_message', Array.from(foundedOverlays.keys()).join(', '));

        const report: IIssueReport = {
          message: reportMessage,
          node: script,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);

        foundedInScripts = true;
      };

      scripts.forEach(findOverlay);
    };

    const findThroughHtml = (_overlayEntries: [string, string[]][]): void => {
      const context: Context = this.context;
      let html: string = '';

      if (typeof (context as any).innerHTML === 'string') {
        html = (context as any).innerHTML;
      } else if ((context as any).outerHTML === 'string') {
        html = (context as any).outerHTML;
      }

      if (html.trim().length === 0) {
        return;
      }

      const foundedOverlays: Map<string, null> = new Map();

      for (const [overlayName, overlayUrls] of _overlayEntries) {

        for (const overlayUrl of overlayUrls) {
          if (html.includes(overlayUrl)) {
            foundedOverlays.set(overlayName, null);
          }
        }
      }

      if (Array.from(foundedOverlays).length === 0) {
        return;
      }

      const reportMessage: string = TranslateService.instant('overlay_report_message', Array.from(foundedOverlays.keys()).join(', '));

      const report: IIssueReport = {
        message: reportMessage,
        node: context,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    // Note: key of below object is later used as a name of overlay vendor
    const overlay: { [key: string]: string[] } = {
      AccessiBe: ['acsbap.com', 'acsbapp.com'],
      AudioEye: ['audioeye.com'],
      EqualWeb: ['nagich.com', 'nagich.co.il'],
      MaxAccess: ['maxaccess.io'],
      TruAbilities: ['truabilities.com'],
      User1st: ['user1st.info'],
      UserWay: ['userway.org']
    };

    const overlayEntries: [string, string[]][] = Object.entries(overlay);

    if (scripts.length > 0) {
      findByScripts(overlayEntries);
    }

    if (foundedInScripts === false) {
      findThroughHtml(overlayEntries);
    }
  }
}
