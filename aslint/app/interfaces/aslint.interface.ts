import { Directionality } from '../constants/aslint';
import { $accessibilityAuditRules } from '../constants/accessibility';
import { IAuditRule } from './audit-rule.interface';

export interface ISkipReasonMessage {
  code: number;
  message: string;
}

interface IReportFormat {
  json: boolean;
}

interface IRulesOption {
  isMarkedAsFalsePositive?: boolean;
  isSelectedForScanning?: boolean;
}

export interface IASLintRunner {
  asyncRunner: boolean;
  context: Element | string;
  debugMode: boolean;
  description: string;
  direction: string | Directionality;
  includeHidden: boolean;
  reportFormat: IReportFormat;
  rules: { [key in $accessibilityAuditRules]: IRulesOption } | {};
  watchDomChanges: boolean;
}

export type Standards = Partial<Record<$accessibilityAuditRules, IAuditRule>>;
