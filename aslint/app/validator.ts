import { Config } from './config';
import { Async } from './utils/async';
import { Time } from './utils/time';
import { Bus } from './services/bus';
import { DomUtility } from './utils/dom';
import { $runnerSettings } from './constants/aslint';
import { AuditStandards, IAuditRule, IAuditStandard } from './interfaces/audit-rule.interface';
import { NODE_TYPE } from './constants/nodeType';
import { TextUtility } from './utils/text';
import { ObjectUtility } from './utils/object';
import { ReportUtility } from './utils/report';
import { IIssueReport } from './interfaces/rule-issue.interface';
import { IAbstractRuleConfig } from './rules/abstract-rule';
import { $auditIssue, $auditRuleSkipReason } from './constants/accessibility';
import {
  IAslintReport, IAslintReportSummary, IAslintRuleReport, IAslintRuleReportResult, IAslintRuleReportStatusType, IAslintRulesReports, IAslintSummaryByCategory, IAslintSummaryByRule, IAslintSummaryBySuccessCriteria, IReportIssuesSummary
} from './interfaces/aslint-report.interface';
import { Context, IHtmlInfo } from './interfaces/context.interface';
import { wcag } from './constants/accessibility-standards/wcag';
import { bestPractice } from './constants/accessibility-standards/essential';
import { busEvent } from './constants/events';
import { Standards } from './interfaces/aslint.interface';
import { Global } from './utils/global';

interface IRegisteredRule {
  ruleConfig: IAbstractRuleConfig;
  ruleTest: (context: Context, validator?: typeof Validator, options?: any) => Promise<void>;
  totalElementsEvaluated: number;
  results: any[];
}

interface IReportedProblem extends IIssueReport {
  id: string;
  ruleConfig: IAbstractRuleConfig;
}
export class Validator {
  private static rules: { [key: string]: IRegisteredRule } = {};
  private static REPORT_ID_PREFIX: string = 'report_';
  private static TIMEOUT: number = 4; // See: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#reasons_for_delays
  private static uniqueProblemId: number = 0;
  private static contextElement: Context;
  private static reports: Record<string, IReportedProblem> = {};
  private static config: Config = Config.getInstance();

  private static getEmptyReportIssuesSummary(): IReportIssuesSummary {
    return {
      error: 0,
      passed: 0,
      skipped: 0,
      warning: 0
    };
  }

  private static resetUniqueProblemIdCounter(): void {
    Validator.uniqueProblemId = 0;
  }

  private static getUniqueProblemId(increment: boolean = true): number {
    const id: number = Validator.uniqueProblemId;

    if (increment) {
      Validator.uniqueProblemId += 1;
    }

    return id;
  }

  private static endOfTesting(): void {
    if (Validator.config.get($runnerSettings.reportFormat) === null || Validator.contextElement === null) {
      return;
    }

    const reportsToSend: IReportedProblem[] = Object.values(Validator.getReports());
    const documentHtmlInfo: IHtmlInfo = DomUtility.getHtmlInfo(document);
    const contextHtmlInfo: IHtmlInfo = DomUtility.getHtmlInfo(Validator.contextElement);
    const summary: IAslintReportSummary = this.getSummary(reportsToSend);
    const rules: IAslintRulesReports = this.getRulesReports(reportsToSend);

    const report: IAslintReport = {
      context: DomUtility.getXPath(Validator.contextElement),
      contextHtmlSize: parseFloat((contextHtmlInfo.htmlSize / 1024).toFixed(2)),
      createdAt: new Date().toISOString(),
      documentHtmlSize: parseFloat((documentHtmlInfo.htmlSize / 1024).toFixed(2)),
      pageTitle: '(no page title defined)',
      rules: rules,
      score: ReportUtility.getScore(summary.byIssueType),
      summary: summary,
      totalElementsOnContext: contextHtmlInfo.nodesNum,
      totalElementsOnDocument: documentHtmlInfo.nodesNum
    };

    if (typeof document.title === 'string') {
      report.pageTitle = document.title;
    } else {
      const titleElement: HTMLTitleElement | null = document.querySelector('title');

      if (titleElement && typeof titleElement.textContent === 'string') {
        report.pageTitle = titleElement.textContent;
      }
    }

    Bus.publish(busEvent.onBusyIndicatorOff);

    const error: any = null;

    Bus.publish(busEvent.onValidatorComplete, error, report);
  }

  private static getRulesReports(reportsToSend: IReportedProblem[]): IAslintRulesReports {
    const accessibilityStandards: Standards = this.getAccessibilityStandards();
    const allReports: IAslintRulesReports = {};

    const fillAllRules = (ruleId: string): void => {
      const ruleKey: string = TextUtility.convertDashesToUnderscores(ruleId);
      const auditRule: IAuditRule | undefined = accessibilityStandards[ruleKey as keyof typeof accessibilityStandards];
      const ruleOptions: IAuditRule = Validator.config.get($runnerSettings.rules)[ruleId];

      if (ruleOptions.isSelectedForScanning === false) {
        return;
      }

      const report: IAslintRuleReport = {
        categories: typeof auditRule !== 'undefined' && Array.isArray(auditRule.categories) ? auditRule.categories : [],
        issueType: ReportUtility.getRuleIssueTypeBySeverity(Validator.rules[ruleId].ruleConfig.severity),
        recommendations: Validator.rules[ruleId].ruleConfig.recommendations,
        resources: Validator.rules[ruleId].ruleConfig.links,
        results: [],
        severity: Validator.rules[ruleId].ruleConfig.severity,
        status: {
          reason: null,
          type: IAslintRuleReportStatusType.passed
        },
        totalElementsEvaluated: Validator.rules[ruleId].totalElementsEvaluated
      };

      allReports[ruleKey] = report;
    };

    const reportRules = (reportIssue: IReportedProblem): void => {
      const ruleId: string = reportIssue.ruleConfig.id;
      const ruleKey: string = TextUtility.convertDashesToUnderscores(ruleId);

      if (typeof allReports[ruleKey] === 'undefined') {
        return;
      }

      const ruleConfig: {
        isMarkedAsFalsePositive?: boolean;
        isSelectedForScanning?: boolean;
      } = Validator.config.get($runnerSettings.rules)[ruleId] || {};

      let skipReason: $auditRuleSkipReason | undefined;

      if (ruleConfig.isSelectedForScanning === false) {
        skipReason = $auditRuleSkipReason.notSelectedForScanning;
      }

      if (ruleConfig.isMarkedAsFalsePositive === true) {
        skipReason = $auditRuleSkipReason.markedAsFalsePositive;
      }

      if (typeof skipReason !== 'undefined') {
        allReports[ruleKey].status = {
          reason: skipReason,
          type: IAslintRuleReportStatusType.skip
        };
      }

      if (allReports[ruleKey]!.status!.type !== IAslintRuleReportStatusType.skip) {
        allReports[ruleKey]!.status!.type = IAslintRuleReportStatusType.error;

        const reportResult: IAslintRuleReportResult = {
          data: typeof reportIssue.contrastData === 'undefined' ? null : reportIssue.contrastData,
          element: {
            html: reportIssue.node !== null ? DomUtility.getEscapedOuterTruncatedHTML(reportIssue.node) : '',
            reference: Validator.config.get($runnerSettings.includeElementReference) ? reportIssue.node : null,
            xpath: reportIssue.node !== null ? DomUtility.getXPath(reportIssue.node) : ''
          },
          message: {
            actual: {
              description: reportIssue.message
            },
            expected: {
              description: ''
            }
          },
          skipReason: typeof reportIssue.skipReason === 'undefined' ? null : (reportIssue.skipReason as any)
        };

        if (ObjectUtility.getTypeOf(reportIssue.contrastData) === 'object') {
          reportResult.data = reportIssue.contrastData;
        }

        allReports[ruleKey].results.push(reportResult);
      }
    };

    Object.keys(Validator.rules).forEach(fillAllRules);
    reportsToSend.forEach(reportRules);

    return allReports;
  }

  private static getSummary(reportsToSend: IReportedProblem[]): IAslintReportSummary {
    const accessibilityStandards: Standards = this.getAccessibilityStandards();

    const byIssueType = (accum: IReportIssuesSummary, value: IReportedProblem): IReportIssuesSummary => {
      accum[ReportUtility.getRuleIssueTypeBySeverity(value.ruleConfig.severity) as keyof typeof accum] += 1;

      return accum;
    };

    const byRule = (accum: IAslintSummaryByRule, value: IReportedProblem): IAslintSummaryByRule => {
      const ruleKey: string = TextUtility.convertDashesToUnderscores(value.ruleConfig.id);

      if (typeof accum[ruleKey as keyof typeof accum] === 'undefined') {
        accum[ruleKey as keyof typeof accum] = Validator.getEmptyReportIssuesSummary();
      }

      const ruleIssueType: $auditIssue = ReportUtility.getRuleIssueTypeBySeverity(value.ruleConfig.severity);
      const reportIssuesSummary: IReportIssuesSummary = accum[ruleKey as keyof typeof accum];

      reportIssuesSummary[ruleIssueType] += 1;

      return accum;
    };

    const byCategory = (accum: IAslintSummaryByCategory, value: IReportedProblem): IAslintSummaryByCategory => {
      const ruleKey: string = value.ruleConfig.id.replace(/-/g, '_');
      const auditRule: IAuditRule | undefined = accessibilityStandards[ruleKey as keyof typeof accessibilityStandards];

      if (typeof auditRule !== 'undefined' && Array.isArray(auditRule.categories)) {
        auditRule.categories.forEach((category: string): void => {
          if (typeof accum[category as keyof typeof accum] === 'undefined') {
            accum[category as keyof typeof accum] = Validator.getEmptyReportIssuesSummary();
          }

          const ruleIssueType: $auditIssue = ReportUtility.getRuleIssueTypeBySeverity(value.ruleConfig.severity);

          accum[category as keyof typeof accum][ruleIssueType] += 1;
        });
      }

      return accum;
    };

    const bySuccessCriteria = (
      accum: IAslintSummaryBySuccessCriteria,
      value: IReportedProblem
    ): IAslintSummaryBySuccessCriteria => {
      const ruleKey: string = TextUtility.convertDashesToUnderscores(value.ruleConfig.id);
      const auditRule: IAuditRule | undefined = accessibilityStandards[ruleKey as keyof typeof accessibilityStandards];

      if (typeof auditRule !== 'undefined' && Array.isArray(auditRule.standards)) {

        const buildReportBySuccessCriteria = (wcagType: string): void => {
          if (typeof accum[wcagType] === 'undefined') {
            accum[wcagType] = Validator.getEmptyReportIssuesSummary();
          }

          const ruleIssueType: $auditIssue = ReportUtility.getRuleIssueTypeBySeverity(value.ruleConfig.severity);

          accum[wcagType][ruleIssueType as keyof typeof accum[typeof wcagType]] += 1;
        };

        auditRule.standards
          .filter((standard: IAuditStandard): boolean => {
            return standard.id === AuditStandards.wcag;
          })
          .map((standard: IAuditStandard): string => {
            return standard[AuditStandards.wcag]!.num;
          })
          .forEach(buildReportBySuccessCriteria);
      }

      return accum;
    };

    const issueCount: IReportIssuesSummary = reportsToSend.reduce(byIssueType, Validator.getEmptyReportIssuesSummary());

    return {
      byCategory: reportsToSend.reduce(byCategory, {} as any),
      byIssueType: issueCount,
      byStandardRule: reportsToSend.reduce(byRule, {} as any),
      byWcagSuccessCriteria: reportsToSend.reduce(bySuccessCriteria, {})
    };
  }

  public static getAccessibilityStandards(): Standards {
    return {
      ...wcag,
      ...bestPractice
    };
  }

  public static getReports(): Record<string, IReportedProblem> {
    return Validator.reports;
  }

  public static getReport(id: string): IReportedProblem {
    return Validator.reports[id];
  }

  public static createReportMessage(messages: string[]): string {
    if (messages.length < 2) {
      return messages.join('');
    }

    return messages.map((message: string, index: number) => {
      return `${index + 1}. ${message}`;
    }).join(' ');
  }

  public static reset(purgeRules: boolean = false): void {
    if (purgeRules) {
      Validator.rules = {};
    } else {
      const resetResults = (rule: string): void => {
        Validator.rules[rule].results.length = 0;
      };

      Object.keys(Validator.rules).forEach(resetResults);
    }

    Validator.resetUniqueProblemIdCounter();
    ObjectUtility.deleteProperties(Validator.reports);

    Bus.publish(busEvent.onValidatorReset);
  }

  public static async runTestsAsynchronously(context: Context): Promise<void> {
    const runAsyncSingleRule = (ruleId: string): Promise<any> => {

      const wrapperAsyncSingleRule = async (): Promise<void> => {
        const ruleConfig: IAuditRule = Validator.config.get($runnerSettings.rules)[ruleId];

        if (ruleConfig.isSelectedForScanning === false) {
          return;
        }

        const performanceStart: number = performance.now();

        await Validator.rules[ruleId]
          .ruleTest(context, Validator, ruleConfig)
          .finally((): void => {
            console.log(`${ruleId} %c${Time.format(performance.now() - performanceStart)}`, 'color: white; background: blueviolet;');
          });
      };

      const asyncRunnerExecutor = (resolve: Function, reject: Function): void => {

        const executeRule = async (): Promise<void> => {
          try {
            resolve(await wrapperAsyncSingleRule());
          } catch (e) {
            reject(e);
          }
        };

        if (typeof Global.context.requestIdleCallback === 'function') {
          window.requestIdleCallback(executeRule);

          return;
        }

        Async.run(
          executeRule,
          this,
          Validator.TIMEOUT
        );
      };

      return new Promise(asyncRunnerExecutor);
    };

    const evaluationPerformanceStart: number = performance.now();
    const allPromises: Promise<void>[] = [];

    for (const rule of Object.keys(Validator.rules).sort()) {
      allPromises.push(runAsyncSingleRule(rule));
    }

    try {
      await Promise.all(allPromises);
    } catch (e) {
      console.error(`[Validator.runTestsAsynchronously] ${e}`);
    }

    console.log(`\nCompleted in %c${Time.format(performance.now() - evaluationPerformanceStart)}`, 'color: white; background: blueviolet;');

    Validator.endOfTesting();
  }

  public static async runTestsSynchronously(context: Context): Promise<void> {
    const evaluationPerformanceStart: number = performance.now();

    const runSyncSingleRule = async (ruleId: string): Promise<void> => {
      const ruleConfig: any = Validator.config.get($runnerSettings.rules)[ruleId];

      if (ruleConfig.isSelectedForScanning === false) {
        return;
      }

      const performanceStart: number = performance.now();

      await Validator.rules[ruleId].ruleTest(context, Validator, ruleConfig);

      console.log(`${ruleId} %c${Time.format(performance.now() - performanceStart)}`, 'color: white; background: blueviolet;');
    };

    const ruleKeys: string[] = Object.keys(Validator.rules).sort();

    for (let i: number = 0, len: number = ruleKeys.length; i < len; i += 1) {
      try {
        await runSyncSingleRule(ruleKeys[i]);
      } catch (e) {
        console.error('[ASLint] There were errors while executing the rules\n', e);
      }
    }

    console.log(`\nCompleted in %c${Time.format(performance.now() - evaluationPerformanceStart)}`, 'color: white; background: blueviolet;');
    Validator.endOfTesting();
  }

  public static register(
    ruleConfig: IAbstractRuleConfig,
    ruleTest: (context: Context, internalValidator?: typeof Validator, validatorOptions?: any) => Promise<void>
  ): void {

    if (Validator.rules[ruleConfig.id]) {
      console.warn(`The rule ${ruleConfig.id} has already been defined`);

      return;
    }

    Validator.rules[ruleConfig.id] = {
      results: [],
      ruleConfig,
      ruleTest: ruleTest,
      totalElementsEvaluated: 0
    };
  }

  public static unregister(ruleId: any): void {
    if (typeof Validator.rules[ruleId] === 'object') {
      delete Validator.rules[ruleId];
    }
  }

  public static getRegisteredRuleNames(): string[] {
    return Object.keys(Validator.rules);
  }

  public static getContextElement(context: string | Element | Document | DocumentFragment): Element | Document | DocumentFragment | null {
    let contextElement: Element | Document | DocumentFragment | null = null;

    if (typeof context === 'string') {
      contextElement = DomUtility.getElementFromCssSelectorOrXpath(context).element;
    } else if (
      ObjectUtility.isHtmlElement(context) ||
      (context && typeof context.nodeType === 'number' && (context.nodeType === NODE_TYPE.DOCUMENT_NODE || context.nodeType === NODE_TYPE.DOCUMENT_FRAGMENT_NODE))
    ) {
      contextElement = context;
    }

    return contextElement;
  }

  public static report(issueReport: IIssueReport): void {
    const rule: IRegisteredRule | undefined = Validator.rules[issueReport.ruleId];

    if (typeof rule === 'undefined') {
      console.warn(`[Validator.report] Unregistered rule ${issueReport.ruleId} is not allowed to run`);

      return;
    }

    let reportIssue: IIssueReport = issueReport;

    const runFilterBeforeRuleReport = (filter: Function): void => {
      reportIssue = filter(reportIssue);
    };

    Config.getFilters(busEvent.onBeforeRuleReport).forEach(runFilterBeforeRuleReport);

    const report: IReportedProblem = {
      id: Validator.REPORT_ID_PREFIX + Validator.getUniqueProblemId(),
      ruleConfig: rule.ruleConfig,
      ...reportIssue
    };

    Validator.reports[report.id] = report;
    Bus.publish(busEvent.onValidatorReport, report);
  }

  public static setTotalElementsEvaluated(ruleId: string, numElements: number): void {
    if (typeof Validator.rules[ruleId] !== 'undefined') {
      Validator.rules[ruleId].totalElementsEvaluated = numElements;
    }
  }

  public static runTests(contextElement: Context): void {
    Validator.reset();

    Validator.contextElement = contextElement;

    Bus.publish(busEvent.onValidatorStarted);

    const nodes: Element[] | null = DomUtility.querySelectorAllExclude('*', contextElement);

    if (nodes === null) {
      console.warn('[Validator] Finished because there are no elements to scan');
      Validator.endOfTesting();

      return;
    }

    Bus.publish(busEvent.onBusyIndicatorOn, `Validating HTML ${nodes.length} elements.`, true);

    if (Validator.config.get($runnerSettings.asyncRunner) === false) {
      Validator.runTestsSynchronously(contextElement);

      return;
    }

    Validator.runTestsAsynchronously(contextElement);
  }
}
