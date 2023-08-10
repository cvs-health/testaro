import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $auditRuleNodeSkipReason, $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';
import { DomUtility } from '../../../utils/dom';
import { Config } from '../../../config';
import { $runnerSettings } from '../../../constants/aslint';
import { Css } from '../../../utils/css';

export class MainElementOnlyOne extends AbstractRule {
  private appConfig: Config = Config.getInstance();

  protected selector: string = 'main';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.main_element_only_one),
    links: [
      {
        content: 'HTML/Elements/main',
        url: 'https://www.w3.org/wiki/HTML/Elements/main#Point'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  private elementShouldBeSkipped(element: HTMLElement): boolean {
    const styles: CSSStyleDeclaration | null = Css.getComputedStyle(element);
    const ariaHidden: Attr | null = DomUtility.getElementAttribute(element, 'aria-hidden');
    let elementShouldBeSkipped: boolean = true;

    if (ariaHidden && ariaHidden.value === 'true') {
      return elementShouldBeSkipped;
    }

    if (this.appConfig.get($runnerSettings.includeHidden)) {
      elementShouldBeSkipped = false;

      return elementShouldBeSkipped;
    }

    if (DomUtility.hasElementSemiOpacity(element, styles)) {
      return elementShouldBeSkipped;
    }

    return false;
  }

  public validate(elements: HTMLElement[]): void {
    if (elements.length < 2) {
      return;
    }

    const checkForIssue = (element: HTMLElement): void => {
      if (this.elementShouldBeSkipped(element)) {
        this.validator.report({
          message: '',
          node: element,
          ruleId: this.ruleConfig.id,
          skipReason: $auditRuleNodeSkipReason.excludedFromScanning
        });

        return;
      }

      const reportMessage: string = TranslateService.instant('main_element_only_one_report_message', [elements.length, TextUtility.escape('main')]);

      const report: IIssueReport = {
        message: reportMessage,
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(checkForIssue);
  }
}
