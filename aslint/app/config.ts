import { ObjectUtility } from './utils/object';
import { Func } from './utils/func';
import { Bus } from './services/bus';
import { IASLintRunner } from './interfaces/aslint.interface';
import { CommonUtility } from './utils/common';
import runnerSettings from './config/runnerSettings.json';
import { busEvent } from './constants/events';

export class Config {
  private static instance: Config;
  private static runnerOptions: { [key: string]: any } | undefined;
  private static filters: { [key: string]: Function[] } = {};
  private references: any;

  private constructor() {
    this.references = {};
  }

  public static getInstance(): Config {
    if (typeof Config.instance === 'undefined') {
      Config.instance = new Config();
    }

    return Config.instance;
  }

  public static get excludeContainers(): (HTMLElement | null)[] {
    return [];
  }

  public static addFilter(filterName: string, handler: Function): void {
    if (typeof this.filters[filterName] === 'undefined') {
      this.filters[filterName] = [];
    }

    if (handler instanceof Function) {
      this.filters[filterName].push(handler);
    }
  }

  public static getFilters(filterName: string): Function[] {
    return Array.isArray(this.filters[filterName]) ? this.filters[filterName] : [];
  }

  private mixCustomWithDefaultSettings(runnerOptions: Partial<IASLintRunner>): void {
    Config.runnerOptions = Func.mixin(Config.runnerOptions, runnerOptions);
  }

  private dispose(): void {
    console.log('%c[Config.dispose]', 'color: blue');

    Bus.unsubscribe(busEvent.onApplicationDispose, this.references.dispose);

    Config.runnerOptions = undefined;
  }

  private initEvents(): void {
    this.references.dispose = this.dispose.bind(this);

    Bus.subscribe(busEvent.onApplicationDispose, this.references.dispose);
  }

  public removeAllOptions(): void {
    Config.runnerOptions = undefined;
  }

  public set(property: string, value: any): void {
    if (ObjectUtility.getTypeOf(Config.runnerOptions) !== 'object') {
      console.warn(`[Config.set] Unable to set option on config because Config.options is not an object. Got typeof ${typeof Config.runnerOptions}`);

      return;
    }

    if (property !== 'resultsCallback' && CommonUtility.hasKey(Config.runnerOptions!, property) === false) {
      console.warn('[Config.set] Trying to set an unknown config property', property, value);

      return;
    }

    CommonUtility.setKey(Config.runnerOptions!, property, value);
  }

  public get(property: string): any {
    if (typeof Config.runnerOptions === 'undefined') {
      if (typeof runnerSettings[property as keyof typeof runnerSettings] !== 'undefined') {
        return runnerSettings[property as keyof typeof runnerSettings];
      }

      return null;
    }

    return (typeof Config.runnerOptions[property] === 'undefined') ? null : Config.runnerOptions[property];
  }

  public init(runnerOptions: Partial<IASLintRunner> = {}): void {
    Config.runnerOptions = runnerSettings;

    this.mixCustomWithDefaultSettings(runnerOptions);
    this.initEvents();
  }
}
