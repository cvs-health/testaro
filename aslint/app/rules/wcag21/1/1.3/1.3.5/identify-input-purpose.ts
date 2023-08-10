import { $accessibilityAuditRules, $severity } from '../../../../../constants/accessibility';
import { CATEGORY_TYPE } from '../../../../../constants/categoryType';
import { IIssueReport } from '../../../../../interfaces/rule-issue.interface';
import { TranslateService } from '../../../../../services/translate';
import { TextUtility } from '../../../../../utils/text';
import { AbstractRule, IAbstractRuleConfig } from '../../../../abstract-rule';


export class IdentifyInputPurpose extends AbstractRule {
  protected selector: string = '[autocomplete]';

  protected ruleConfig: IAbstractRuleConfig = {
    id: TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.identify_input_purpose),
    links: [
      {
        content: '4.10.18.7.1. Autofilling form controls: the autocomplete attribute',
        url: 'https://www.w3.org/TR/html52/sec-forms.html#autofilling-form-controls-the-autocomplete-attribute'
      },
      {
        content: 'WCAG 2.1 - 1.3.5 Identify Input Purpose Level AA',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/identify-input-purpose.html'
      }
    ],
    recommendations: [],
    severity: $severity.high,
    type: CATEGORY_TYPE.WCAG_AA
  };

  public validate(elements: Element[]): void {

    const completion: string[] = [
      'on',
      'off'
    ];

    const paymentAndAddress: string[] = [
      'billing',
      'shipping'
    ];

    const detailedCompletion: string[] = [
      'additional-name',
      'address-level1',
      'address-level2',
      'address-level3',
      'address-level4',
      'address-line1',
      'address-line2',
      'address-line3',
      'bday',
      'bday-day',
      'bday-month',
      'bday-year',
      'cc-additional-name',
      'cc-csc',
      'cc-exp',
      'cc-exp-month',
      'cc-exp-year',
      'cc-family-name',
      'cc-given-name',
      'cc-name',
      'cc-number',
      'cc-type',
      'country',
      'country-name',
      'current-password',
      'family-name',
      'given-name',
      'honorific-prefix',
      'honorific-suffix',
      'language',
      'name',
      'new-password',
      'nickname',
      'one-time-code',
      'organization',
      'organization-title',
      'photo',
      'postal-code',
      'sex',
      'street-address',
      'transaction-amount',
      'transaction-currency',
      'url',
      'username'
    ];

    const contactType: string[] = [
      'fax',
      'home',
      'mobile',
      'pager',
      'work'
    ];

    const contactCompletion: string[] = [
      'email',
      'impp',
      'tel',
      'tel-area-code',
      'tel-country-code',
      'tel-extension',
      'tel-local',
      'tel-local-prefix',
      'tel-local-suffix',
      'tel-national'
    ];

    const validateElement = (element: Element): void => {
      let autocompleteAttr: string | null = element.getAttribute('autocomplete');

      if (autocompleteAttr === null) {
        return;
      }

      autocompleteAttr = autocompleteAttr.trim();

      if (completion.includes(autocompleteAttr) || autocompleteAttr.length === 0) {
        return;
      }

      const problem: IIssueReport = {
        message: '',
        node: element,
        ruleId: this.ruleConfig.id
      };

      const tokens: string[] = autocompleteAttr.split(/\s+/g).map((token: string): string => {
        return token.trim();
      });

      if ((/section-.*/).test(tokens[0])) {
        tokens.shift();
      }

      if (paymentAndAddress.includes(tokens[0])) {
        tokens.shift();
      }

      if (contactType.includes(tokens[0])) {
        tokens.shift();

        if (contactCompletion.includes(tokens[0]) === false) {
          problem.message = TranslateService.instant('identify_input_purpose_report_message_1', [contactCompletion.join(', '), tokens[0]]);
        }
      }

      if (tokens.length > 0) {
        const invalidTokens: string[] = [];

        for (const token of tokens) {
          if (detailedCompletion.includes(token) === false) {
            invalidTokens.push(token);
          }
        }

        if (invalidTokens.length > 0) {
          problem.message = TranslateService.instant('identify_input_purpose_report_message_2', [invalidTokens.join(', ')]);
        }
      }

      if (problem.message.length === 0) {
        return;
      }

      this.validator.report(problem);
    };

    elements.forEach(validateElement);
  }
}
