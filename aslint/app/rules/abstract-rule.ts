import { IRule } from '../interfaces/rule.interface';
import { CATEGORY_TYPE } from '../constants/categoryType';
import { $severity } from '../constants/accessibility';
import { DomUtility } from '../utils/dom';
import { Validator } from '../validator';
import { Config } from '../config';
import { Context } from '../interfaces/context.interface';

type Nodes = Document[] | HTMLElement[] | Element[] | StyleSheetList[] | CSSStyleSheet[];

export interface IAbstractRuleConfig {
  id: string;
  type: CATEGORY_TYPE;
  severity: $severity;
  links: { content: string; url: string }[];
  recommendations: any[];
}

export abstract class AbstractRule implements IRule {
  protected context: Context;
  protected options: any;
  protected validator: typeof Validator;
  protected selector: string | (() => Nodes);
  protected abstract ruleConfig: IAbstractRuleConfig;

  constructor() {
    this.validator = Validator;
    this.selector = 'html';
    this.context = document.documentElement;
  }

  protected collectElements(): Nodes | null {
    if (typeof this.selector === 'undefined') {
      throw new Error(`[AbstractRule] The selector must be a string or function, but there is type of ${typeof this.selector}`);
    }

    if (typeof this.selector === 'function') {
      return this.selector();
    }

    return DomUtility.querySelectorAllExclude(
      this.selector,
      this.context,
      Config.excludeContainers,
      []
    );
  }

  public abstract validate(nodes: Document[] | HTMLElement[] | Element[] | StyleSheetList | StyleSheetList[] | CSSStyleSheet[] | null): void;

  public get config(): IAbstractRuleConfig {
    return this.ruleConfig;
  }

  public get id(): string {
    return this.config.id;
  }

  // eslint-disable-next-line require-await
  public async run(context: Context, validator?: typeof Validator, options?: any): Promise<void> {
    this.context = context;
    this.options = (typeof options === 'object') ? options : {};
    this.validator = (typeof validator !== 'undefined') ? validator : Validator;

    let nodes: Nodes | null = this.collectElements();
    const totalElementsEvaluated: number = nodes === null ? 0 : nodes.length;

    this.validator.setTotalElementsEvaluated(this.ruleConfig.id, totalElementsEvaluated);

    const getFilter = (filter: Function): void => {
      nodes = filter(this.ruleConfig.id, nodes);
    };

    Config.getFilters('before-rule-validate').forEach(getFilter);

    this.validate(nodes);
  }

  public registerValidator(): void {
    this.validator.register(this.ruleConfig, this.run.bind(this));
  }

}
