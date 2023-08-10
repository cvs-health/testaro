import { IAbstractRuleConfig } from '../rules/abstract-rule';

export interface IRule {
  validate(nodes: Element[] | StyleSheetList | StyleSheetList[]): void;
}

export interface IRuleOptions extends IAbstractRuleConfig {

}
