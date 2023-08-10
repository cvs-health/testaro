import { $auditRuleNodeSkipReason } from '../constants/accessibility';
import { IASLintRuleContrast } from '../interfaces/aslint-report.interface';
import { Context } from './context.interface';

export interface IIssueReport {
  contrastData?: IASLintRuleContrast;
  expected?: any;
  message: string;
  node: Context | null;
  ruleId: string;
  skipReason?: $auditRuleNodeSkipReason;
}
