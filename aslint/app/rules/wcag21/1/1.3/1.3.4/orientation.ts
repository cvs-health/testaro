import { TextUtility } from '../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../services/translate';
import { $severity, $accessibilityAuditRules } from '../../../../../constants/accessibility';
import { DomUtility } from '../../../../../utils/dom';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';

export class OrientationRule extends AbstractRule {
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.orientation),
    links: [
      {
        content: 'Understanding Success Criterion 1.3.4: Orientation',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/orientation'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_AA
  };

  private processStyleSheet(styleSheet: StyleSheet, originalHref?: string | null): void {
    let report: IIssueReport;
    const len: number = (styleSheet as CSSStyleSheet).cssRules.length;

    for (let i: number = 0; i < len; i += 1) {
      const cssMediaRule: CSSMediaRule = ((styleSheet as CSSStyleSheet).cssRules[i] as CSSMediaRule);

      if ((styleSheet as CSSStyleSheet).cssRules[i] instanceof CSSMediaRule && cssMediaRule.media instanceof MediaList) {

        for (let j: number = 0, styleSheetMediaLength = cssMediaRule.media.length; j < styleSheetMediaLength; j += 1) {
          if (cssMediaRule.media[j].search(/orientation: portrait/) !== -1 || cssMediaRule.media[j].search(/orientation: landscape/) !== -1) {

            const debugDetails: string[] = [];

            if (typeof originalHref === 'string') {
              debugDetails.push(`location: <code>${originalHref}</code>`);
            } else {
              debugDetails.push(`location: <code>${styleSheet.href}</code>`);
            }

            if ((styleSheet as CSSStyleSheet).cssRules.length > 0 && typeof (styleSheet as CSSStyleSheet).cssRules[i].cssText === 'string') {
              debugDetails.push(`cssText: <code>${TextUtility.truncate((styleSheet as CSSStyleSheet).cssRules[i].cssText, 100)}</code>`);
            }

            report = {
              message: TranslateService.instant('orientation_rule_report_message_1', [cssMediaRule.media[j], debugDetails.join(', ')]),
              node: null,
              ruleId: this.ruleConfig.id
            };

            this.validator.report(report);
          }
        }

      }
    }

    if (styleSheet.media instanceof MediaList) {
      const styleSheetTotal: number = styleSheet.media.length;

      for (let i: number = 0; i < styleSheetTotal; i += 1) {
        if (styleSheet.media[i].search(/orientation: portrait/) !== -1 || styleSheet.media[i].search(/orientation: landscape/) !== -1) {

          let href: string = '';

          if (typeof styleSheet.href === 'string' && styleSheet.href.length > 0) {
            href = styleSheet.href;
          } else if (typeof originalHref === 'string' && originalHref.length > 0) {
            href = originalHref;
          }

          const debugDetails: string[] = [];

          debugDetails.push(`location: <code>${href}</code>`);

          if ((styleSheet as CSSStyleSheet).cssRules.length > 0 && typeof (styleSheet as CSSStyleSheet).cssRules[i].cssText === 'string') {
            debugDetails.push(`cssText: <code>${TextUtility.truncate((styleSheet as CSSStyleSheet).cssRules[i].cssText, 100)}</code>`);
          }

          report = {
            message: TranslateService.instant('orientation_rule_report_message_1', [styleSheet.media[i], debugDetails.join(', ')]),
            node: null,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);
        }
      }

    }
  }

  public async validate(styleSheetList: StyleSheetList): Promise<void> {

    const handleResponse = async (styleSheet: StyleSheet, res: Response): Promise<string | void> => {
      if (res.status >= 200 || res.status < 400) {
        return await res.text();
      }

      const report: IIssueReport = {
        message: TranslateService.instant('orientation_rule_report_message_2', [styleSheet.href, res.status]),
        node: null,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);

      return Promise.resolve();
    };

    for (let i: number = 0, len = styleSheetList.length; i < len; i += 1) {
      const styleSheet: StyleSheet = styleSheetList[i];

      try {
        if (typeof (styleSheet as CSSStyleSheet).cssRules === 'object') {
          this.processStyleSheet(styleSheet);
        }
      } catch (e) {
        let styleContent: string | void;

        if (typeof styleSheet.href === 'string') {
          styleContent = await window.fetch(styleSheet.href, {
            mode: 'no-cors'
          })
            .then(handleResponse.bind(this, styleSheet));
        }

        if (typeof styleContent === 'undefined') {
          return;
        }

        const copyStyle: HTMLStyleElement = DomUtility.createCSS(styleContent, undefined, styleSheet.media.mediaText);
        const sheet: CSSStyleSheet = copyStyle.sheet as CSSStyleSheet;

        this.processStyleSheet(sheet, styleSheet.href);

        document.head.removeChild(copyStyle);
      }
    }
  }

  public async run(): Promise<void> {
    await this.validate(document.styleSheets);
  }
}
