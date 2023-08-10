import { DomUtility } from '../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../utils/text';
import { TranslateService } from '../../../../../services/translate';
import { $severity } from '../../../../../constants/accessibility';
import { NODE_TYPE } from '../../../../../constants/nodeType';
import { CommonUtility } from '../../../../../utils/common';
import { $accessibilityAuditRules } from '../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';

export class HtmlLangAttr extends AbstractRule {
  private root: HTMLElement;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.html_lang_attr),
    links: [
      {
        content: 'H57: Using language attributes on the html element',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H57.html'
      },
      {
        content: '8.1 Specifying the language of content: the lang attribute',
        url: 'https://www.w3.org/TR/html4/struct/dirlang.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  constructor(root: HTMLElement = document.documentElement) {
    super();
    this.root = root;
  }

  public async run(context: Document | Element, validator: any, options?: any): Promise<void> {
    if (CommonUtility.hasKey(context, 'nodeType') && context.nodeType !== NODE_TYPE.DOCUMENT_NODE) {
      return;
    }
    this.root = DomUtility.getRootElement();
    await super.run(context, validator, options);
  }

  public validate(): void {
    const root: HTMLElement = this.root;

    if (typeof root !== 'object') {
      return;
    }

    const report: IIssueReport = {
      message: '',
      node: root,
      ruleId: this.ruleConfig.id
    };

    const langAttribute: string | null = root.getAttribute('lang');

    if (typeof langAttribute === 'string') {

      if (TextUtility.safeTrim(langAttribute).length === 0) {
        report.message = TranslateService.instant('html_lang_attr_report_message_3', [DomUtility.getEscapedOuterHTML(root), langAttribute]);
      } else {
        const langCodes: string[] = langAttribute.split('-');
        const langCodesLength: number = langCodes.length;

        if (langCodesLength > 3) {
          report.message = TranslateService.instant('html_lang_attr_report_message_1', [langAttribute]);
        }
      }

    } else {
      report.message = TranslateService.instant('html_lang_attr_report_message_2', [DomUtility.getEscapedOuterHTML(root)]);
    }

    if (report.message.length === 0) {
      return;
    }

    this.validator.report(report);
  }
}
