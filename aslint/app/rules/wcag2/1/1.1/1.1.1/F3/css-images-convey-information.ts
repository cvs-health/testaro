import { DomUtility } from '../../../../../../utils/dom';
import { Css } from '../../../../../../utils/css';
import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class CssImagesConveyInformation extends AbstractRule {
  protected selector: string = `*${[
    ':not(:root)',
    ':not(head)',
    ':not(title)',
    ':not(body)',
    ':not(link)',
    ':not(meta)',
    ':not(title)',
    ':not(style)',
    ':not(script)',
    ':not(noscript)',
    ':not(iframe)'
  ].join('')}`;

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.css_images_convey_information),
    links: [
      {
        content: 'F3: Failure of Success Criterion 1.1.1 due to using CSS to include images that convey important information',
        url: 'https://www.w3.org/WAI/GL/2016/WD-WCAG20-TECHS-20160105/F3'
      }
    ],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(elements: HTMLElement[]): void {
    const reportNode = (element: HTMLElement): void => {
      const backgroundImage: string | null = Css.getStyle(element, 'background-image');

      if (DomUtility.hasDirectTextDescendant(element) === false || backgroundImage === null || backgroundImage === 'none' || DomUtility.isElementVisible(element) === false) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('css_images_convey_information_report_message', [TextUtility.truncateInTheMiddle(backgroundImage)]),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(reportNode);
  }
}
