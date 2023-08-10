import { DomUtility } from '../../../../../../utils/dom';
import { CATEGORY_TYPE } from '../../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';
import { $severity } from '../../../../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../../../../abstract-rule';

interface ISortedElementHeaderData {
  expectedIndex: number;
  headerIndex: number;
  node: Element;
}

export class HeadingsHierarchy extends AbstractRule {
  protected selector: string = 'h1, h2, h3, h4, h5, h6';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.headings_hierarchy),
    links: [
      {
        content: 'H42: Using h1-h6 to identify headings',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/H42.html'
      },
      {
        content: 'G141: Organizing a page using headings',
        url: 'https://www.w3.org/TR/WCAG20-TECHS/G141.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_A
  };

  public validate(headingElements: HTMLHeadingElement[]): void {
    const hierarchy: ISortedElementHeaderData[] = [];
    const sorted: ISortedElementHeaderData[] = [];

    const buildHeadersCollection = (headingElement: HTMLHeadingElement): void => {
      const currentElementName: string = headingElement.nodeName.toLowerCase();
      const currentElementIndex: number = parseInt(currentElementName.replace(/\D/g, ''), 10);

      const elementData: ISortedElementHeaderData = {
        expectedIndex: 0,
        headerIndex: currentElementIndex,
        node: headingElement
      };

      hierarchy.push(elementData);
    };

    const report = (headingElement: ISortedElementHeaderData): void => {
      if (headingElement.headerIndex === headingElement.expectedIndex) {
        return;
      }

      const _report: IIssueReport = {
        expected: {
          tag: `H${String(headingElement.expectedIndex)}`
        },
        message: TranslateService.instant('headings_hierarchy_report_message', [DomUtility.getNodeWithTextContent(headingElement.node), String(headingElement.expectedIndex)]),
        node: headingElement.node,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(_report);
    };

    const sortHeaders = (item: ISortedElementHeaderData, index: number): void => {
      const hierarchyDistance: number = index === 0 ? 0 : item.headerIndex - sorted[index - 1].expectedIndex;

      let validHeaderIndex: number = item.headerIndex;

      if (index === 0 && item.headerIndex !== 1) {
        validHeaderIndex = 1;
      } else if (hierarchyDistance < -1) {
        validHeaderIndex = hierarchy[index - 1].headerIndex + hierarchyDistance + 1;
      } else if (hierarchyDistance > 1) {
        validHeaderIndex = item.headerIndex - hierarchyDistance + 1;
      }

      const sortedElementData: ISortedElementHeaderData = {
        expectedIndex: validHeaderIndex,
        headerIndex: item.headerIndex,
        node: item.node
      };

      sorted.push(sortedElementData);
    };

    headingElements.forEach(buildHeadersCollection);
    hierarchy.forEach(sortHeaders);
    sorted.forEach(report);
  }
}
