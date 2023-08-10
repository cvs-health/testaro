import { isReadable, readability, TinyColor } from '@ctrl/tinycolor';

import { TextUtility } from '../../../../../../utils/text';
import {
  $accessibilityAuditRules,
  $auditRuleNodeSkipReason,
  $severity
} from '../../../../../../constants/accessibility';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { Env } from '../../../../../../utils/env';
import { DomUtility } from '../../../../../../utils/dom';
import { Css } from '../../../../../../utils/css';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';
import { ObjectUtility } from '../../../../../../utils/object';
import { Config } from '../../../../../../config';
import { $runnerSettings } from '../../../../../../constants/aslint';

const SKIP_ELEMENTS: string = `${[
  ':root',
  'head',
  'body',
  'title',
  'style',
  'script',
  'noscript',
  'meta',
  'link',
  'br',
  'hr',
  'object',
  'path',
  'g',
  'linearGradient',
  'stop',
  'desc',
  'filter',
  'img',
  'input',
  'iframe',
  'code',
  'defs',
  ':empty'
].map((i: string): string => {
  return `:not(${i})`;
}).join('')}`;

export abstract class ColorContrastStatePseudoClassesAbstract extends AbstractRule {
  protected ruleConfig: IAbstractRuleConfig;
  private cssId: string = `aslintSimulatedStyle_${(Math.random() * 999999999).toFixed(0)}`;
  private styles: CSSStyleRule[] = [];
  private pseudo: $accessibilityAuditRules;
  private appConfig: Config = Config.getInstance();
  private readonly pattern: RegExp;

  constructor(pseudo: $accessibilityAuditRules) {
    super();

    this.pseudo = pseudo;
    this.selector = `${this.pseudoClassSelector},${SKIP_ELEMENTS}`;

    this.ruleConfig = {
      id: TextUtility.convertUnderscoresToDashes(this.pseudo),
      links: [
        {
          content: 'Technique G18: Ensuring that a contrast ratio of at least 4.5:1 exists between text (and images of text) and background behind the text',
          url: 'http://www.w3.org/TR/WCAG20-TECHS/G18'
        }
      ],
      recommendations: [],
      severity: $severity.low,
      type: CATEGORY_TYPE.WCAG_AA
    };

    this.pattern = new RegExp(`\\:(${this.pseudoClass})`);
  }

  private get pseudoClass(): string {
    switch (this.pseudo) {
      case $accessibilityAuditRules.color_contrast_state_pseudo_classes_active:
        return 'active';
      case $accessibilityAuditRules.color_contrast_state_pseudo_classes_focus:
        return 'focus';
      case $accessibilityAuditRules.color_contrast_state_pseudo_classes_hover:
        return 'hover';
      default:
        console.warn('[ColorContrastStatePseudoClassesAbstract.pseudoClass] pseudo definition not specified. Got ', this.pseudo);

        return '';
    }
  }

  private get pseudoClassSelector(): string {
    switch (this.pseudoClass) {
      case 'focus':
      case 'hover':
        return '*';
      case 'active':
        return 'a,button';
      default:
        console.warn('[ColorContrastStatePseudoClassesAbstract.pseudoClassSelector] pseudoClass definition not specified. Got ', this.pseudoClass);

        return '';
    }
  }

  private insertStyleSheet(styleContent: string): void {
    const copyStyle: HTMLStyleElement = DomUtility.createCSS(styleContent);
    const sheet: CSSStyleSheet | null = copyStyle.sheet;

    if (sheet === null) {
      console.warn('[ColorContrastStatePseudoClassesAbstract.insertStyleSheet] Tried to insert styleContent for non-existing element', styleContent);

      return;
    }

    for (let i: number = 0, len: number = sheet.cssRules.length; i < len; i += 1) {
      if (sheet.cssRules[i] instanceof CSSStyleRule) {
        const rule: CSSStyleRule = sheet.cssRules[i] as CSSStyleRule;

        if (rule.selectorText.match(this.pattern)) {
          this.styles.push(rule);
        }
      }
    }

    document.head.removeChild(copyStyle);
  }

  private async loadStyleSheets(): Promise<void> {
    const handleError = (styleSheet: StyleSheet, response: Response, error: string): void => {
      const report: IIssueReport = {
        message: TranslateService.instant('color_contrast_state_pseudo_classes_report_message_css_failed_to_load', [
          styleSheet.href,
          response.status,
          error
        ]),
        node: ObjectUtility.isHtmlElement(styleSheet.ownerNode) ? styleSheet.ownerNode as Element : null,
        ruleId: this.ruleConfig.id,
        skipReason: $auditRuleNodeSkipReason.unableToLoadStyleSheet
      };

      this.validator.report(report);
    };

    const handleResponse = async (styleSheet: StyleSheet, res: Response): Promise<void> => {
      if (res.status >= 200 || res.status < 400) {
        this.insertStyleSheet(await res.text());

        return;
      }

      handleError(styleSheet, res, res.statusText);
    };

    const styleSheetsLength: number = document.styleSheets.length;

    const getCssText = (cssRule: CSSRule): string => {
      return cssRule.cssText;
    };

    for (let i: number = 0; i < styleSheetsLength; i += 1) {
      const styleSheet: StyleSheet = document.styleSheets[i];

      if (typeof styleSheet.href === 'undefined' || styleSheet.href === null || styleSheet.href.length === 0) {
        if (
          styleSheet.ownerNode &&
          styleSheet.ownerNode.nodeName &&
          styleSheet.ownerNode.nodeName.toLowerCase() === 'style' &&
          styleSheet.ownerNode.firstChild &&
          typeof styleSheet.ownerNode.firstChild.textContent === 'string'
        ) {
          this.insertStyleSheet(styleSheet.ownerNode.firstChild.textContent);
        } else if (Env.isTest) {

          this.insertStyleSheet(Array.from((styleSheet as CSSStyleSheet).cssRules).map(getCssText)
            .join(' '));
        }
      } else if (typeof window.fetch === 'function') {
        let response: Partial<Response> = {
          status: 400
        };

        try {
          response = await window.fetch(styleSheet.href, {
            mode: 'no-cors'
          });

          handleResponse(styleSheet, response as Response);
        } catch (e) {
          handleError(styleSheet, response as Response, e);
        }
      }
    }
  }

  private startPseudoClassSimulation(): void {
    let style: string = '';

    const activePseudoClass: string | undefined = this.pseudoClass;

    for (const cssStyleRule of this.styles) {
      if (cssStyleRule.selectorText.includes(`:${activePseudoClass}`)) {
        style += `${cssStyleRule.cssText.replace(new RegExp(`:${activePseudoClass}`, 'g'), '')}\n`;
      }
    }

    DomUtility.createCSS(style, this.cssId);
  }

  private stopPseudoClassSimulation(): void {
    const element: HTMLElement | null = document.getElementById(this.cssId);

    if (element === null) {
      return;
    }

    element.remove();
  }

  private elementShouldBeSkipped(element: HTMLElement, styles: CSSStyleDeclaration): boolean {
    let elementShouldBeSkipped: boolean = true;

    if (element.hasChildNodes() === false) {
      return elementShouldBeSkipped;
    }

    if (['fixed', 'sticky'].includes(styles.position)) {
      return elementShouldBeSkipped;
    }

    if (Css.getElementBackgroundImage(element, true) !== null) {
      return elementShouldBeSkipped;
    }

    const determinedBackgroundColor: TinyColor | null = Css.getBackgroundColor(element);

    if (determinedBackgroundColor === null) {
      return elementShouldBeSkipped;
    }

    if (determinedBackgroundColor.toName() === 'transparent') {
      return elementShouldBeSkipped;
    }

    if (determinedBackgroundColor.toHex() === new TinyColor(styles.color).toHex()) {
      return elementShouldBeSkipped;
    }

    if (determinedBackgroundColor.getAlpha() < 1) {
      return elementShouldBeSkipped;
    }

    if (DomUtility.hasElementSemiOpacity(element, styles)) {
      return elementShouldBeSkipped;
    }

    const elementStyleBackgroundColor: string | null = Css.getStyle(element, 'background-color');
    let elementBackgroundColor: TinyColor;

    if (elementStyleBackgroundColor === null) {
      elementBackgroundColor = new TinyColor('transparent');
    } else {
      elementBackgroundColor = new TinyColor(elementStyleBackgroundColor);
    }

    if (elementBackgroundColor.toName() !== 'transparent' && DomUtility.hasElementSemiTransparentBackground(element, styles)) {
      return elementShouldBeSkipped;
    }

    if (this.appConfig.get($runnerSettings.includeHidden)) {
      elementShouldBeSkipped = false;

      return elementShouldBeSkipped;
    }

    if (DomUtility.isElementVisible(element) === false) {
      return elementShouldBeSkipped;
    }

    return false;
  }

  public static getSkippedElements(elements: string[]): string {
    const findElement = (item: string): string => {
      return `:not(${item})`;
    };

    return elements.map(findElement).join('');
  }

  public validate(nodes: HTMLElement[]): void {
    const checkColorContrast = (element: HTMLElement): void => {
      let bgColor: TinyColor;
      let warningBackgroundImageMessage: string = '';

      if (DomUtility.hasDirectTextDescendant(element) === false) {
        return;
      }

      const styles: CSSStyleDeclaration | null = Css.getComputedStyle(element);

      if (styles === null) {
        return;
      }

      if (this.elementShouldBeSkipped(element, styles)) {
        this.validator.report({
          message: '',
          node: element,
          ruleId: this.ruleConfig.id,
          skipReason: $auditRuleNodeSkipReason.excludedFromScanning
        });

        return;
      }

      const report: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      if (styles.position === 'fixed') {
        report.message = TranslateService.instant('color_contrast_state_pseudo_classes_report_message_1');
        this.validator.report(report);

        return;
      }

      bgColor = new TinyColor(styles.backgroundColor);
      const fgColor: TinyColor = new TinyColor(styles.color);

      if (bgColor.toName() === 'transparent') {
        const bgColorParent: TinyColor | null = Css.getBackgroundColor(element);

        if (bgColorParent === null) {
          const bodyStyle: CSSStyleDeclaration | null = Css.getComputedStyle(document.body);

          bgColor = new TinyColor(bodyStyle!.backgroundColor);

          if (bgColor.toName() === 'transparent') {
            report.message = TranslateService.instant('color_contrast_state_pseudo_classes_report_message_2', [
              this.pseudoClass || '(undefined)',
              `${DomUtility.getEscapedOuterHTML(document.body)}`
            ]);
            this.validator.report(report);

            return;
          }
        } else {
          bgColor = bgColorParent;
        }
      }

      fgColor.setAlpha(styles.opacity);

      const ratio: string = String(parseFloat(readability(bgColor, fgColor).toFixed(2)));
      const backgroundImage: string | null = Css.getStyle(element, 'background-image');

      const styleFontSize: string | null = Css.getStyle(element, 'font-size');
      const fontSize: number = styleFontSize ? Css.covertPxToPt(styleFontSize, true) : 10;
      const fontWeight: string | null = Css.getStyle(element, 'font-weight');

      if (typeof backgroundImage !== 'string' || ['', 'none'].includes(backgroundImage.trim()) === false) {
        warningBackgroundImageMessage = TranslateService.instant('color_contrast_state_pseudo_classes_warning_message');
      }

      if (Css.isLargeText(element)) {
        const isReadableLargeSize: boolean = isReadable(bgColor, fgColor, {
          level: 'AA',
          size: 'large'
        });

        if (isReadableLargeSize === false) {
          report.message = TranslateService.instant('color_contrast_state_pseudo_classes_report_message_3', [
            this.pseudoClass || '(undefined)',
            `${ratio}`,
            `${bgColor.toHexString()}`,
            `${fgColor.toHexString()}`,
            `${fontSize}`,
            fontWeight ? fontWeight : '',
            `${warningBackgroundImageMessage}`
          ]);

          report.contrastData = {
            contrastBackground: bgColor.toHexString(),
            contrastColor: fgColor.toHexString()
          };

          this.validator.report(report);
        }
      } else {
        const isReadableSmallSize: boolean = isReadable(bgColor, fgColor, {
          level: 'AA',
          size: 'small'
        });

        if (isReadableSmallSize === false) {
          report.message = TranslateService.instant('color_contrast_state_pseudo_classes_report_message_4', [
            this.pseudoClass || '(undefined)',
            `${ratio}`,
            `${bgColor.toHexString()}`,
            `${fgColor.toHexString()}`,
            `${fontSize}`,
            fontWeight ? fontWeight : '',
            `${warningBackgroundImageMessage}`
          ]);
          report.contrastData = {
            contrastBackground: bgColor.toHexString(),
            contrastColor: fgColor.toHexString()
          };

          this.validator.report(report);
        }
      }
    };

    nodes.forEach(checkColorContrast);
  }

  public async run(context: Document | Element, validator?: any, options?: any): Promise<void> {
    await this.loadStyleSheets();
    this.startPseudoClassSimulation();
    await super.run(context, validator, options);
    this.stopPseudoClassSimulation();
  }
}
