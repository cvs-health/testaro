import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class ObsoleteHtmlElements extends AbstractRule {
  protected selector: string = [
    'acronym',
    'applet',
    'basefont',
    'bgsound',
    'big',
    'blink',
    'center',
    'dir',
    'font',
    'frame',
    'frameset',
    'hgroup',
    'isindex',
    'listing',
    'marquee',
    'multicol',
    'nextid',
    'nobr',
    'noembed',
    'noframes',
    'plaintext',
    's',
    'spacer',
    'strike',
    'tt',
    'u',
    'xmp'
  ].join(', ');

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.obsolete_html_elements),
    links: [
      {
        content: 'Non-conforming features',
        url: 'https://www.w3.org/TR/html5/obsolete.html#non-conforming-features'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: HTMLElement[]): void {
    const reportNode = (element: HTMLElement): void => {
      const problem: IIssueReport = {
        message: TranslateService.instant('obsolete_html_elements_report_message', [element.nodeName.toLowerCase()]),
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(problem);
    };

    elements.forEach(reportNode);
  }
}
