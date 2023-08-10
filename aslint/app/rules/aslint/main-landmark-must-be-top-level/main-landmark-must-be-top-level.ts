import { DomUtility } from '../../../utils/dom';
import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class MainLandmarkMustBeTopLevel extends AbstractRule {
  protected selector: string = '[role="main"]';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.main_landmark_must_be_top_level),
    links: [
      {
        content: 'Accessible Rich Internet Applications (WAI-ARIA) 1.0 Specification: main role',
        url: 'http://www.w3.org/TR/wai-aria/roles#main'
      },
      {
        content: 'ARIA11: Using ARIA landmarks to identify regions of a page',
        url: 'http://www.w3.org/TR/WCAG20-TECHS/ARIA11'
      },
      {
        content: 'HTML5: The MAIN element',
        url: 'http://www.w3.org/TR/html5/sections.html#the-main-element'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    let parent: HTMLElement | null;
    let parentNodeWithRole: Element | null = null;
    let role: string | null;
    const PARENT_ROLE_EXCEPTION: string[] = [
      'application',
      'document'
    ];

    if (elements.length === 0 || elements[0].parentElement === null) {
      return;
    }

    parent = elements[0].parentElement;

    while (parent && parent.getAttribute) {
      role = parent.getAttribute('role');

      if (typeof role === 'string' && PARENT_ROLE_EXCEPTION.indexOf(role) === -1) {
        parentNodeWithRole = parent;
        break;
      }

      parent = parent.parentElement;
    }

    if (parentNodeWithRole === null) {
      return;
    }

    const reportMessage: string = TranslateService.instant('main_landmark_must_be_top_level_report_message', [DomUtility.getEscapedOuterHTML(parentNodeWithRole)]);

    const report: IIssueReport = {
      message: reportMessage,
      node: parentNodeWithRole,
      ruleId: this.ruleConfig.id
    };

    this.validator.report(report);
  }
}
