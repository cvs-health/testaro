import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

const OBSOLETE_HTML_ATTRIBUTES: { [key: string]: string[] } = {
  accept: ['form'],
  align: ['caption', 'col', 'div', 'embed', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'iframe', 'input', 'img', 'legend', 'object', 'p', 'table', 'tbody', 'thead', 'tfoot', 'td', 'th', 'tr'],
  alink: ['body'],
  allowtransparency: ['iframe'],
  archive: ['object'],
  axis: ['td', 'th'],
  background: ['body', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th'],
  bgcolor: ['body', 'table', 'td', 'th', 'tr'],
  border: ['img', 'object'],
  bordercolor: ['table'],
  cellpadding: ['table'],
  cellspacing: ['table'],
  char: ['col', 'tbody', 'thead', 'tfoot', 'td', 'th', 'tr'],
  charoff: ['col', 'tbody', 'thead', 'tfoot', 'td', 'th', 'tr'],
  charset: ['a', 'link'],
  classid: ['object'],
  clear: ['br'],
  code: ['object'],
  codebase: ['object'],
  codetype: ['object'],
  color: ['hr'],
  compact: ['dl', 'ol', 'ul'],
  coords: ['a'],
  datafld: ['a', 'applet', 'button', 'div', 'fieldset', 'frame', 'iframe', 'img', 'input', 'label', 'legend', 'marquee', 'object', 'param', 'select', 'span', 'textarea'],
  dataformatas: ['button', 'div', 'input', 'label', 'legend', 'marquee', 'object', 'option', 'select', 'span', 'table'],
  datapagesize: ['table'],
  datasrc: ['a', 'applet', 'button', 'div', 'frame', 'iframe', 'img', 'input', 'label', 'legend', 'marquee', 'object', 'option', 'select', 'span', 'table', 'textarea'],
  declare: ['object'],
  event: ['script'],
  for: ['script'],
  frame: ['table'],
  frameborder: ['iframe'],
  height: ['td', 'th'],
  hspace: ['embed', 'iframe', 'input', 'img', 'object'],
  ismap: ['input'],
  language: ['script'],
  link: ['body'],
  lowsrc: ['img'],
  marginbottom: ['body'],
  marginheight: ['body', 'iframe'],
  marginleft: ['body'],
  marginright: ['body'],
  margintop: ['body'],
  marginwidth: ['body', 'iframe'],
  methods: ['a', 'link'],
  name: ['a', 'embed', 'img', 'option'],
  nohref: ['area'],
  noshade: ['hr'],
  nowrap: ['td', 'th'],
  profile: ['head'],
  rules: ['table'],
  scheme: ['meta'],
  scope: ['td'],
  scrolling: ['iframe'],
  shape: ['a'],
  size: ['hr'],
  standby: ['object'],
  summary: ['table'],
  target: ['link'],
  text: ['body'],
  type: ['param', 'li', 'ul'],
  urn: ['a', 'link'],
  usemap: ['input'],
  valign: ['col', 'tbody', 'thead', 'tfoot', 'td', 'th', 'tr'],
  valuetype: ['param'],
  version: ['html'],
  vlink: ['body'],
  vspace: ['embed', 'iframe', 'input', 'img', 'object'],
  width: ['col', 'hr', 'pre', 'table', 'td', 'th']
};

export class ObsoleteHtmlAttributes extends AbstractRule {
  protected selector: string = (() => {
    const createSelector = (elementData: [string, string[]]): string => {
      const attribute: string = elementData[0];
      const elements: string[] = elementData[1];

      const create = (elementName: string): string => {
        return `${elementName}[${attribute}]`;
      };

      return elements.map(create).join(',');
    };

    const selector: string = Object.entries(OBSOLETE_HTML_ATTRIBUTES).map(createSelector)
      .join(',');

    return selector;
  })();

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.obsolete_html_attributes),
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

      const attributes: Attr[] = Array.from(element.attributes);
      const foundedAttributes: string[] = [];

      const checkAttribute = (attr: Attr): void => {
        const elms: string[] | undefined = OBSOLETE_HTML_ATTRIBUTES[attr.localName];

        if (Array.isArray(elms)) {
          if (elms.includes(element.nodeName.toLowerCase())) {
            foundedAttributes.push(attr.localName);
          }
        }
      };

      attributes.forEach(checkAttribute);

      if (foundedAttributes.length === 0) {
        return;
      }

      const reportMessage: string = TranslateService.instant('obsolete_html_attributes_report_message', foundedAttributes.join(', '));

      const report: IIssueReport = {
        message: reportMessage,
        node: element,
        ruleId: this.ruleConfig.id
      };

      this.validator.report(report);
    };

    elements.forEach(reportNode);
  }
}
