import {
  $accessibilityAuditRules, $auditRuleNodeSkipReason, $auditRuleSkipReason, IssueCategory
} from '../constants/accessibility';
import { Context } from './context.interface';

export enum IAslintRuleReportStatusType {
  error = 'error',
  passed = 'passed',
  skip = 'skip'
}

export interface IAslintReport {
  context: string;
  contextHtmlSize: number;
  createdAt: string;
  documentHtmlSize: number;
  pageTitle: string;
  rules: IAslintRulesReports;
  score: number;
  summary: IAslintReportSummary;
  totalElementsOnContext: number;
  totalElementsOnDocument: number;
}

export type IAslintRulesReports = Record<string, IAslintRuleReport>;

export type IAslintSummaryByRule = Record<$accessibilityAuditRules, IReportIssuesSummary>;

export type IAslintSummaryByCategory = Record<IssueCategory, IReportIssuesSummary>;

export type IAslintSummaryBySuccessCriteria = Record<string, IReportIssuesSummary>;

export interface IAslintReportSummary {
  byCategory: IAslintSummaryByCategory;
  byIssueType: IReportIssuesSummary;
  byStandardRule: IAslintSummaryByRule;
  byWcagSuccessCriteria: IAslintSummaryBySuccessCriteria;
}

export interface IAslintRuleReport {
  categories: string[];
  issueType: string;
  recommendations: string[];
  resources: { content: string; url: string }[];
  results: IAslintRuleReportResult[];
  severity: string;
  status?: IAslintRuleReportStatus;
  totalElementsEvaluated: number;
}

export interface IAslintRuleReportStatus {
  reason: $auditRuleSkipReason | null;
  type: IAslintRuleReportStatusType;
}

export interface IAslintRuleReportResult {
  element: {
    html: string;
    reference: Context | null;
    xpath: string;
  };
  message: {
    actual: {
      description: string;
    };
    expected: {
      description: string;
    };
  };
  skipReason: $auditRuleSkipReason | $auditRuleNodeSkipReason | null;
  data?: IASLintRuleData;
}

export interface IReportIssuesSummary {
  error: number;
  passed: number;
  skipped: number;
  warning: number;
}

export interface IASLintRuleContrast {
  contrastBackground?: string;
  contrastColor?: string;
  contrastRatio?: string;
}

export type IASLintRuleData = IASLintRuleContrast | null;
