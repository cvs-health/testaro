import { DomUtility } from '../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { Config } from '../../../../../config';
import { TextUtility } from '../../../../../utils/text';
import { TranslateService } from '../../../../../services/translate';
import { $severity } from '../../../../../constants/accessibility';
import { NODE_TYPE } from '../../../../../constants/nodeType';
import { Css } from '../../../../../utils/css';
import { CommonUtility } from '../../../../../utils/common';
import { $accessibilityAuditRules } from '../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';

export class PositionSticky extends AbstractRule {
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.position_sticky),
    links: [
      {
        content: 'Success Criterion 1.4.8 Visual Presentation',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-visual-presentation.html'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_AAA
  };

  private styleSheets: StyleSheet[];

  constructor(styleSheets: StyleSheet[] = []) {
    super();
    this.styleSheets = styleSheets;
  }

  private validateFromContext(elements: Element[] | null): void {
    const checkForPositionSticky = (element: Element): void => {
      const computedPosition: string | null = Css.getStyle(element, 'position');

      if (computedPosition === 'sticky') {
        const report: IIssueReport = {
          message: TranslateService.instant('position_sticky_context_css_report_message', [DomUtility.getEscapedOuterHTML(element)]),
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      } else {
        const inlineStylePosition: string | null = Css.getStyle(element, 'position');

        if (inlineStylePosition && inlineStylePosition.length > 0 && inlineStylePosition === 'sticky') {
          const report: IIssueReport = {
            message: TranslateService.instant('position_sticky_context_inline_report_message', [DomUtility.getEscapedOuterHTML(element)]),
            node: element,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);
        }

      }
    };

    if (elements === null) {
      return;
    }

    elements.forEach(checkForPositionSticky);
  }

  public async run(context: Document | Element, validator?: any, options?: any): Promise<void> {
    if (CommonUtility.hasKey(context, 'nodeType') && context.nodeType === NODE_TYPE.DOCUMENT_NODE) {
      this.styleSheets = Array.from(document.styleSheets);
      await super.run(context, validator, options);

      return;
    }

    const nonExistsElements = (element: HTMLElement | null): boolean => {
      return element !== null;
    };

    const excludeContainers: HTMLElement[] = Config.excludeContainers.filter(nonExistsElements) as HTMLElement[];
    const excludeElements: HTMLElement[] = [];
    const nodes: Element[] | null = DomUtility.querySelectorAllExclude('*', context, excludeContainers, excludeElements);

    this.validateFromContext(nodes);
  }

  public validate(): void {
    if (this.styleSheets.length === 0) {
      return;
    }

    const findPositionStickyInWholeHTML = (styleSheet: StyleSheet): any => {
      let currentRule: CSSRule | null;
      let selector: string;
      let styleObject: CSSStyleDeclaration;
      let isCSSembededInline: string;
      let href: string | null;

      if (styleSheet.hasOwnProperty('rules') === false || styleSheet.href) {
        return;
      }

      const rules: CSSRuleList = (styleSheet as CSSStyleSheet).rules;
      const len: number = rules.length;

      for (let i: number = 0; i < len; i += 1) {
        currentRule = rules[i];
        styleObject = (currentRule as CSSStyleRule).style;

        if (currentRule === null || currentRule.parentStyleSheet === null || typeof styleObject === 'undefined' || styleObject.position.length === 0 || styleObject.position.indexOf('sticky') === -1) {
          continue;
        }

        href = currentRule.parentStyleSheet.href;

        if (typeof href === 'string') {
          isCSSembededInline = TranslateService.instant('position_sticky_embeded_inline_1', [href]);
        } else {
          isCSSembededInline = TranslateService.instant('position_sticky_embeded_inline_2', [DomUtility.getEscapedOuterHTML(currentRule.parentStyleSheet.ownerNode as Element)]);
        }

        selector = currentRule.cssText;

        const report: IIssueReport = {
          message: TranslateService.instant('position_sticky_report_message', [selector, isCSSembededInline]),
          node: null,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    this.styleSheets.forEach(findPositionStickyInWholeHTML);
  }
}
