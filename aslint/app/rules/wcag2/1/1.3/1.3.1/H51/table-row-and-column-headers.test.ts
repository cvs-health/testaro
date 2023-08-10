import { TableRowAndColumnHeaders } from './table-row-and-column-headers';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('TableRowAndColumnHeaders#', () => {

    let fakeDom;
    const selector = 'table';

    new TableRowAndColumnHeaders().registerValidator();

    beforeEach(() => {
      fakeDom = document.createElement('div');
      fakeDom.id = 'fakedom';
      document.body.appendChild(fakeDom);

      Validator.reset();
    });

    afterEach(() => {
      DomUtility.remove(document.getElementById('fakedom'));
      fakeDom = undefined;
    });

    it('should return 2 reports when there are 2 tables without thead and tbody', () => {

      fakeDom.innerHTML = '<table><thead></thead></table><table><tbody></tbody>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableRowAndColumnHeaders().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('The table has no defined headers. Make sure that rows and columns are identified using <code>&lt;th&gt;</code> elements. Content of the table should be wrapped using <code>&lt;tbody&gt;</code> element.');
      expect(Validator.getReport('report_0').ruleId).toBe('table-row-and-column-headers');
      expect(Validator.getReport('report_1').message).toBe('The table has no defined headers. Make sure that rows and columns are identified using <code>&lt;th&gt;</code> elements. If applicable then head of the columns of the table should be wrapped using <code>&lt;thead&gt;</code> element.');
      expect(Validator.getReport('report_1').ruleId).toBe('table-row-and-column-headers');
    });

    it('should return 1 report when there is empty table', () => {

      fakeDom.innerHTML = '<table></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableRowAndColumnHeaders().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The table has no defined headers. Make sure that rows and columns are identified using <code>&lt;th&gt;</code> elements. Content of the table should be wrapped using <code>&lt;tbody&gt;</code> element. If applicable then head of the columns of the table should be wrapped using <code>&lt;thead&gt;</code> element.');
      expect(Validator.getReport('report_0').ruleId).toBe('table-row-and-column-headers');
    });

    it('should return 1 report when there is table without th', () => {

      fakeDom.innerHTML = '<table><tr><td>TD ONLY</td></tr></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableRowAndColumnHeaders().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The table has no defined headers. Make sure that rows and columns are identified using <code>&lt;th&gt;</code> elements. If applicable then head of the columns of the table should be wrapped using <code>&lt;thead&gt;</code> element.');
      expect(Validator.getReport('report_0').ruleId).toBe('table-row-and-column-headers');
    });

    it('should return 1 report when there is table without thead', () => {

      fakeDom.innerHTML = '<table><tbody><tr><td>TBODY only</td></tr></tbody></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableRowAndColumnHeaders().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The table has no defined headers. Make sure that rows and columns are identified using <code>&lt;th&gt;</code> elements. If applicable then head of the columns of the table should be wrapped using <code>&lt;thead&gt;</code> element.');
      expect(Validator.getReport('report_0').ruleId).toBe('table-row-and-column-headers');
    });

    it('should return 1 report when there is table without tbody', () => {

      fakeDom.innerHTML = '<table><thead><tr><td>THEAD only</td></tr></thead></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableRowAndColumnHeaders().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The table has no defined headers. Make sure that rows and columns are identified using <code>&lt;th&gt;</code> elements. Content of the table should be wrapped using <code>&lt;tbody&gt;</code> element.');
      expect(Validator.getReport('report_0').ruleId).toBe('table-row-and-column-headers');
    });

    it('should return 1 report when there is thead and tbody, but no defined th', () => {
      fakeDom.innerHTML = '<table><thead>Head</thead><tbody>Body</tbody></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableRowAndColumnHeaders().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The table has no defined headers. Make sure that rows and columns are identified using <code>&lt;th&gt;</code> elements.');
      expect(Validator.getReport('report_0').ruleId).toBe('table-row-and-column-headers');
    });

    it('should return no report when there is th and td', () => {

      fakeDom.innerHTML = '<table><tr><th>Head</th></tr><tr><td>Body</td></tr></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableRowAndColumnHeaders().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is th', () => {
      fakeDom.innerHTML = '<table><tr><th>Head</th></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableRowAndColumnHeaders().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
