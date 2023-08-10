import { $auditIssue, $severity } from '../constants/accessibility';
import { ReportUtility } from './report';

describe('ReportUtility', () => {

  it('should indicate that class exists', () => {
    const reportUtility = new ReportUtility();

    expect(reportUtility).toBeDefined();
  });

  describe('#getRuleIssueTypeBySeverity', () => {

    it('should return error for "critical", "high" and "low" severities', () => {
      expect(ReportUtility.getRuleIssueTypeBySeverity($severity.critical)).toBe($auditIssue.error);
      expect(ReportUtility.getRuleIssueTypeBySeverity($severity.critical)).toBe($auditIssue.error);
      expect(ReportUtility.getRuleIssueTypeBySeverity($severity.critical)).toBe($auditIssue.error);
    });

    it('should return warning for "info" severity', () => {
      expect(ReportUtility.getRuleIssueTypeBySeverity($severity.info)).toBe($auditIssue.warning);
    });

    it('should identify any other undetermined severity as no-issue i.e. "passed"', () => {
      expect(ReportUtility.getRuleIssueTypeBySeverity('qwerty')).toBe($auditIssue.passed);
    });

  });

  describe('#getScore', () => {

    it('should return expected scores for different combinations of issues', () => {
      expect(ReportUtility.getScore({} as any)).toBe(100);

      expect(ReportUtility.getScore({
        error: 0,
        passed: 456,
        warning: 123
      })).toBe(97);

      expect(ReportUtility.getScore({
        error: 23,
        passed: 76,
        warning: 11
      })).toBe(76);

      expect(ReportUtility.getScore({
        error: 33,
        passed: 0,
        warning: 55
      })).toBe(0);
    });

  });

});
