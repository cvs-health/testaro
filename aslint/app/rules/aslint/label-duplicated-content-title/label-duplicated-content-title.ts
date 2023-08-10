import { DomUtility } from '../../../utils/dom';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $accessibilityAuditRules, $severity } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class LabelDuplicatedContentTitle extends AbstractRule {
  protected selector: string = 'label[title]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.label_duplicated_content_title),
    links: [],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {
    const checkLabel = (element: HTMLElement): void => {
      const labelContent: string = DomUtility.getText(element, true);
      const labelTitle: string = element.title;

      if (labelContent === labelTitle) {
        const report: IIssueReport = {
          message: TranslateService.instant('label_duplicated_content_title_report_message'),
          node: element,
          ruleId: this.ruleConfig.id
        };

        this.validator.report(report);
      }
    };

    elements.forEach(checkLabel);
  }
}
