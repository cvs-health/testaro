import { DomUtility } from '../../../../../../utils/dom';
import { Css } from '../../../../../../utils/css';
import { $runnerSettings } from '../../../../../../constants/aslint';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity, $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';
import { Config } from '../../../../../../config';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class MissingAltAttribute extends AbstractRule {
  private appConfig: Config = Config.getInstance();
  protected selector: string = 'img:not([alt]), area:not([alt]), input[type="image"]:not([alt]), [role="img"]:not([alt])';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.missing_alt_attribute),
    links: [
      {
        content: 'F65: Failure of Success Criterion 1.1.1 due to omitting the alt attribute or text alternative on img elements, area elements, and input elements of type "image"',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/F65.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  private elementShouldBeSkipped(element: HTMLElement | Element): boolean {
    let elementShouldBeSkipped: boolean = true;

    if (this.appConfig.get($runnerSettings.includeHidden)) {
      elementShouldBeSkipped = false;

      return elementShouldBeSkipped;
    }

    const styles: CSSStyleDeclaration | null = Css.getComputedStyle(element);
    const ariaHidden: Attr | null = DomUtility.getElementAttribute(element, 'aria-hidden');

    if (ariaHidden && ariaHidden.value === 'true') {
      return elementShouldBeSkipped;
    }

    if (DomUtility.isElementVisible(element) === false) {
      return elementShouldBeSkipped;
    }

    if (DomUtility.hasElementSemiOpacity(element, styles)) {
      return elementShouldBeSkipped;
    }

    return false;
  }

  public validate(htmlElements: Element[]): void {
    const reportNode = (htmlElement: Element): void => {

      if (this.elementShouldBeSkipped(htmlElement)) {
        this.validator.report({
          message: '',
          node: htmlElement,
          ruleId: this.ruleConfig.id,
          skipReason: $auditRuleNodeSkipReason.excludedFromScanning
        });

        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('missing_alt_attribute_report_message'),
        node: htmlElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    htmlElements.forEach(reportNode);
  }
}
