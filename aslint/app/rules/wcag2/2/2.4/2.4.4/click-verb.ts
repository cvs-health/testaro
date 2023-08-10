import { DomUtility } from '../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../utils/text';
import { TranslateService } from '../../../../../services/translate';
import { $severity } from '../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';

export class ClickVerb extends AbstractRule {
  protected selector: string = 'a';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.click_verb),
    links: [
      {
        content: 'Link Purpose (In Context)',
        url: 'https://www.w3.org/TR/WCAG21/#link-purpose-in-context'
      },
      {
        content: 'Don\'t use "click here" as link text',
        url: 'https://www.w3.org/QA/Tips/noClickHere'
      }
    ],
    recommendations: [],
    severity: $severity.low,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(nodes: HTMLAnchorElement[]): void {
    const STRING_OUT_OF_CONTEXT: Set<string> = new Set([
      'click',
      'click here',
      'click this',
      'click me'
    ]);

    const reportNode = (element: HTMLAnchorElement): void => {
      if (element.hasChildNodes() === false) {
        return;
      }

      const content: string = TextUtility.safeTrim(DomUtility.nodesToText(element));

      if (STRING_OUT_OF_CONTEXT.has(content.toLowerCase()) === false) {
        return;
      }

      const report: IIssueReport = {
        message: TranslateService.instant('click_verb_report_message'),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    nodes.forEach(reportNode);
  }
}
