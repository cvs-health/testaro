import { $auditIssue, $severity } from '../constants/accessibility';
export class ReportUtility {

  public static getRuleIssueTypeBySeverity(severity: string): $auditIssue {
    switch (severity) {
      case $severity.critical:
        return $auditIssue.error;

      case $severity.high:
        return $auditIssue.error;

      case $severity.low:
        return $auditIssue.error;

      case $severity.info:
        return $auditIssue.warning;

      default:
        return $auditIssue.passed;
    }
  }

  public static getScore(issueCount: { error: number; warning: number; passed: number }): number {
    const errors: number = issueCount.error + issueCount.warning / 10;
    const total: number = issueCount.passed + errors;

    let errorRatio: number = 0;

    if (total > 0) {
      errorRatio = errors / total;
    }

    return Math.round((1 - errorRatio) * 100);
  }

}
