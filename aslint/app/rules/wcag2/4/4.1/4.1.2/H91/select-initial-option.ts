import { TextUtility } from '../../../../../../utils/text';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

export class SelectInitialOption extends AbstractRule {
  protected selector: string = 'select';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.select_initial_option),
    links: [
      {
        content: 'H91: Using HTML form controls and links',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H91'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(selectElements: HTMLSelectElement[]): void {
    const checkForOptionSelected = (select: HTMLSelectElement): void => {
      const options: HTMLOptionsCollection = select.options;
      const optionsCount: number = options.length;

      for (let i: number = 0; i < optionsCount; i += 1) {
        if (options[i].getAttribute('selected') !== null) {
          return;
        }
      }

      const report: IIssueReport = {
        message: TranslateService.instant('select_initial_option_report_message', [TextUtility.escape('<option>')]),
        node: select,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    selectElements.forEach(checkForOptionSelected);
  }
}
