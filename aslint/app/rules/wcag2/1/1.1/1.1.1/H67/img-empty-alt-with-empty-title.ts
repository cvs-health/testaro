import { DomUtility } from '../../../../../../utils/dom';
import { Css } from '../../../../../../utils/css';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { $runnerSettings } from '../../../../../../constants/aslint';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity, $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';
import { Config } from '../../../../../../config';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class ImgEmptyAltWithEmptyTitle extends AbstractRule {
  private appConfig: Config = Config.getInstance();

  protected selector: string = 'img[alt]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.img_empty_alt_with_empty_title),
    links: [
      {
        content: 'H67: Using null alt text and no title attribute on img elements for images that AT should ignore',
        url: 'https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/H67'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  private elementShouldBeSkipped(element: HTMLElement): boolean {
    const styles: CSSStyleDeclaration | null = Css.getComputedStyle(element);
    let elementShouldBeSkipped: boolean = true;

    if (this.appConfig.get($runnerSettings.includeHidden)) {
      elementShouldBeSkipped = false;

      return elementShouldBeSkipped;
    }

    if (DomUtility.hasElementSemiOpacity(element, styles)) {
      return elementShouldBeSkipped;
    }

    return false;
  }

  public validate(imageElements: HTMLImageElement[]): void {
    const reportNode = (imageElement: HTMLImageElement): void => {
      let message: string = '';
      const titleAttribute: string | null = imageElement.getAttribute('title');
      const altAttribute: string | null = imageElement.getAttribute('alt');

      if (titleAttribute === null || altAttribute === null) {
        return;
      }

      if (this.elementShouldBeSkipped(imageElement)) {
        this.validator.report({
          message: '',
          node: imageElement,
          ruleId: this.ruleConfig.id,
          skipReason: $auditRuleNodeSkipReason.excludedFromScanning
        });

        return;
      }

      const altContainsOnlyWhiteSpaces: boolean = TextUtility.containsOnlyWhiteSpaces(altAttribute);

      if (altAttribute.length > 0 && altContainsOnlyWhiteSpaces === false) {
        return;
      }

      if (TextUtility.containsOnlyWhiteSpaces(titleAttribute)) {
        return;
      }

      message += TranslateService.instant('img_empty_alt_with_empty_title_report_message');

      if (altContainsOnlyWhiteSpaces) {
        message += ` ${TranslateService.instant('img_empty_alt_with_empty_title_report_message_alt_whitespaces')}`;
      }

      const report: IIssueReport = {
        message: message,
        node: imageElement,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    imageElements.forEach(reportNode);
  }
}
