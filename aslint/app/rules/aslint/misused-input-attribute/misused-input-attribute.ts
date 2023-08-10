import { CATEGORY_TYPE } from '../../../constants/categoryType';
import { IIssueReport } from '../../../interfaces/rule-issue.interface';
import { TextUtility } from '../../../utils/text';
import { TranslateService } from '../../../services/translate';
import { $severity } from '../../../constants/accessibility';
import { $accessibilityAuditRules } from '../../../constants/accessibility';
import { AbstractRule, IAbstractRuleConfig } from '../../abstract-rule';

export class MisusedInputAttribute extends AbstractRule {
  protected selector: string = 'input';
  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.misused_input_attribute),
    links: [
      {
        content: 'HTML5 form additions',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input'
      },
      {
        content: 'Common input element attributes',
        url: 'https://www.w3.org/TR/html5/forms.html#common-input-element-attributes'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  public validate(elements: Element[]): void {
    const SUPPORTED_INPUT_ATTRIBUTES: string[] = [
      'accept',
      'accessKey',
      'autocapitalize',
      'autocomplete',
      'autofocus',
      'checked',
      'defaultChecked',
      'defaultValue',
      'dirName',
      'disabled',
      'indeterminate',
      'list',
      'maxLength',
      'minLength',
      'min',
      'max',
      'multiple',
      'name',
      'pattern',
      'placeholder',
      'readOnly',
      'required',
      'selectionDirection',
      'selectionEnd',
      'selectionStart',
      'size',
      'src',
      'step',
      'tabIndex',
      'type',
      'useMap',
      'value',
      'valueAsDate',
      'valueAsNumber',
      'width',
      'willValidate'
    ];

    const attributeAliases: any = {
      accesskey: 'accessKey',
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing',
      class: 'className',
      codebase: 'codeBase',
      colspan: 'colSpan',
      defaultchecked: 'defaultChecked',
      defaultvalue: 'defaultValue',
      dirname: 'dirName',
      for: 'htmlFor',
      formaction: 'formAction',
      formenctype: 'formEncType',
      formmethod: 'formMethod',
      formnovalidate: 'formNoValidate',
      formtarget: 'formTarget',
      frameborder: 'frameBorder',
      framespacing: 'frameSpacing',
      ismap: 'isMap',
      longdesc: 'longDesc',
      maxlength: 'maxLength',
      nowrap: 'noWrap',
      placeholder: 'placeholder',
      readonly: 'readOnly',
      rowspan: 'rowSpan',
      selectiondirection: 'selectionDirection',
      selectionend: 'selectionEnd',
      selectionstart: 'selectionStart',
      tabindex: 'tabIndex',
      usemap: 'useMap',
      validationmessage: 'validationMessage',
      valueasdate: 'valueAsDate',
      valueasnumber: 'valueAsNumber',
      willvalidate: 'willValidate'
    };

    const isSupportedAttribute = (element: Element, attribute: string): boolean => {
      const alias: string = attributeAliases[attribute.toLowerCase()] || attribute;

      return alias in element;
    };

    const checkSupportForInputAttribute = (element: Element): void => {
      let nodeAttrValue: string | null;

      const checkAttributes = (attr: string): void => {
        nodeAttrValue = element.getAttribute(attr);

        if (typeof nodeAttrValue === 'string' && isSupportedAttribute(element, attr) === false) {
          const reportMessage: string = TranslateService.instant('misused_input_attribute_report_message', [attr]);

          const report: IIssueReport = {
            message: reportMessage,
            node: element,
            ruleId: this.ruleConfig.id
          };

          this.validator.report(report);
        }
      };

      SUPPORTED_INPUT_ATTRIBUTES.forEach(checkAttributes);
    };

    elements.forEach(checkSupportForInputAttribute);
  }
}
