import { $severity } from '../constants/accessibility';
import { CATEGORY_TYPE } from '../constants/categoryType';
import { AbstractRule, IAbstractRuleConfig } from './abstract-rule';

export class RuleFactory extends AbstractRule {
  protected selector: string = '';

  protected ruleConfig: IAbstractRuleConfig = {
    id: '',
    links: [],
    recommendations: [],
    severity: $severity.info,
    type: CATEGORY_TYPE.BEST_PRACTICE
  };

  constructor(
    ruleConfig: IAbstractRuleConfig,
    selector: string
  ) {
    super();
    this.ruleConfig = ruleConfig;
    this.selector = selector;
  }

  public validate(_nodes: HTMLElement[] | Element[] | StyleSheetList | StyleSheetList[] | CSSStyleSheet[] | null): void { }
}
