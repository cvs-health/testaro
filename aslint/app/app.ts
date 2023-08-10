import 'array-flat-polyfill';

import runnerSettings from './config/runnerSettings.json';
import { version } from '../package.json';
import { Config } from './config';
import { Console } from './utils/console';
import { Validator } from './validator';
import { Bus, BusListenersPool } from './services/bus';
import { TranslateService } from './services/translate';
import { LoadRules } from './rules/loadRules';
import { $runnerSettings } from './constants/aslint';
import { CATEGORY_TYPE } from './constants/categoryType';
import { ObjectUtility } from './utils/object';
import { IAbstractRuleConfig } from './rules/abstract-rule';
import { $severity } from './constants/accessibility';
import { RuleFactory } from './rules/rule.factory';
import { busEvent } from './constants/events';
import { TextUtility } from './utils/text';
import { IRuleOptions } from './interfaces/rule.interface';
import { Context } from './interfaces/context.interface';
export class App {
  private references: { [key: string]: Function };
  private configInstance: Config;
  private loadRules: LoadRules;
  private mutationObserver!: MutationObserver;

  public version: string;

  constructor() {
    this.references = {};
    this.configInstance = Config.getInstance();
    this.loadRules = new LoadRules();
    this.version = version;

    Console.init();
  }

  private initEvents(): void {
    this.references.dispose = this.dispose.bind(this);

    Bus.subscribe(busEvent.onApplicationDispose, this.references.dispose);
    Bus.subscribe(busEvent.onValidatorComplete, this.configInstance.get($runnerSettings.resultsCallback));
  }

  private dispose(): void {
    console.log('[App] %cdispose', 'color: blue');

    if (this.mutationObserver instanceof MutationObserver) {
      this.mutationObserver.disconnect();
    }

    Bus.unsubscribe(busEvent.onApplicationDispose, this.references.dispose);
    Bus.unsubscribe(busEvent.onValidatorComplete, this.configInstance.get($runnerSettings.resultsCallback));
  }

  private runValidatorTests(context: Context): void {
    Validator.runTests(context);
  }

  private watchContextMutations(context: Context, runner: () => void): void {
    if (this.mutationObserver instanceof MutationObserver) {
      this.mutationObserver.disconnect();
    }

    const mutationCallback = (mutationsList: MutationRecord[]): void => {
      for (const mutation of mutationsList) {
        if (['attributes', 'childList'].includes(mutation.type)) {
          let node: Node = mutation.target;

          if (node === document.head) {
            continue;
          }

          while (node.nodeType === Node.ELEMENT_NODE && node.parentNode) {
            if ((node as Element).getAttribute('id') === this.configInstance.get('containerId')) {
              continue;
            }
            node = node.parentNode;
          }
          runner();
          break;
        }
      }
    };

    this.mutationObserver = new MutationObserver(mutationCallback);

    this.mutationObserver.observe(context, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }

  public config(runnerOptions: { [key: string]: any } = {}): App {
    this.configInstance.init(Object.assign({}, runnerOptions));

    return this;
  }

  public setLocale(locale: string): App {
    TranslateService.setCurrentLocale(locale);

    return this;
  }

  public addListener(eventName: string, callback: Function): App {
    Bus.subscribe(eventName, callback, BusListenersPool.external);

    return this;
  }

  public removeListener(eventName: string, callback?: Function): App {
    Bus.unsubscribe(eventName, callback, BusListenersPool.external);

    return this;
  }

  public addFilter(filterName: string, handler: Function): App {
    Config.addFilter(filterName, handler);

    return this;
  }

  // IAuditRule
  public addRule(newRuleId: string, ruleConfiguration: IAbstractRuleConfig, validator: Function, selector: string, ruleOptions?: IRuleOptions): App {
    const ruleId: string = newRuleId.trim();

    if (typeof newRuleId !== 'string' || ruleId.trim().length === 0) {
      throw new Error(`[App.addRule][${ruleId}] ruleId must be a non-empty string`);
    }

    if (ObjectUtility.isTypeOf(ruleConfiguration, 'object') === false) {
      throw new Error(`[App.addRule][${ruleId}] ruleConfig must me an object`);
    }

    const ruleConf: IAbstractRuleConfig = ObjectUtility.deepMerge(runnerSettings, ruleConfiguration);

    ruleConf.id = newRuleId;

    const categoryTypes: string[] = Object.values(CATEGORY_TYPE);

    if (categoryTypes.includes(ruleConf.type) === false) {
      throw new Error(`[App.addRule] [${ruleId}] Property type on ruleConfiguration must be one of the: ${categoryTypes.join(', ')}. Got ${typeof ruleConf.type}`);
    }

    const severities: $severity[] = Object.values($severity);

    if (severities.includes(ruleConf.severity) === false) {
      throw new Error(`[App.addRule] [${ruleId}] Property severity on ruleConfiguration must be one of the: ${severities.join(', ')}. Got ${ruleConf.severity}`);
    }

    if (Array.isArray(ruleConf.links) === false) {
      throw new Error(`[App.addRule] [${ruleId}] Property links on ruleConfiguration must be an array, but got ${typeof ruleConf.links}`);
    }

    if (Array.isArray(ruleConf.recommendations) === false) {
      throw new Error(`[App.addRule] [${ruleId}] ruleConfig.recommendations must be an array, but got ${typeof ruleConf.recommendations}`);
    }

    if (typeof validator !== 'function') {
      throw new Error(`[App.addRule] [${ruleId}] validator must be a function, but got ${typeof validator}`);
    }

    const ruleFactory: RuleFactory = new RuleFactory(ruleConf, selector);

    ruleFactory.validate = validator.bind(ruleFactory);
    ruleFactory.registerValidator();

    if (typeof ruleOptions !== 'undefined') {
      this.configInstance.get($runnerSettings.rules)[ruleId] = ruleOptions;
    }

    return this;
  }

  public setRule(ruleId: string, ruleOptions: any): App {
    if (typeof ruleOptions !== 'undefined') {
      this.configInstance.get($runnerSettings.rules)[ruleId] = ruleOptions;
    }

    return this;
  }

  public setRules(ruleNames: string[], ruleOptions: any): App {
    const setRule = (ruleName: string): void => {
      this.setRule(ruleName, ruleOptions);
    };

    ruleNames.forEach(setRule);

    return this;
  }

  public run(callback?: Function): void | Promise<any> {
    if (typeof callback !== 'undefined' && typeof callback !== 'function') {
      throw new Error(`[App.run] passed callback must be type of function, but got ${typeof callback}`);
    }

    this.config();

    const context: string | Element | Document | DocumentFragment = this.configInstance.get($runnerSettings.context);
    const contextElement: Context | null = Validator.getContextElement(context);

    if (contextElement === null) {
      let contextError: string;

      if (typeof context === 'string' && TextUtility.safeTrim(context).length === 0) {
        contextError = TranslateService.instant('context_unable_to_determine_empty_string');
      } else {
        contextError = TranslateService.instant('context_unable_to_determine', [typeof context, String(context)]);
      }

      throw new Error(`[Validator.runTests] ${contextError}`);
    }

    this.loadRules.registerDefaultRulesForValidator();

    const initAndRun = (): void => {
      this.initEvents();

      if (this.configInstance.get($runnerSettings.watchDomChanges)) {
        this.watchContextMutations(contextElement, this.runValidatorTests.bind(this, contextElement));
      }

      this.runValidatorTests(contextElement);
    };

    if (typeof callback === 'function') {
      this.configInstance.set($runnerSettings.resultsCallback, callback);
      initAndRun();

      return;
    }

    const initPromiseWrapper = (resolve: Function, reject: Function): void => {

      const resultsCallback = (err: any, res: any): void => {
        if (err) {
          reject(err);

          return;
        }

        resolve(res);
      };

      this.configInstance.set($runnerSettings.resultsCallback, resultsCallback);

      initAndRun();
    };

    // eslint-disable-next-line consistent-return
    return new Promise(initPromiseWrapper);
  }
}
