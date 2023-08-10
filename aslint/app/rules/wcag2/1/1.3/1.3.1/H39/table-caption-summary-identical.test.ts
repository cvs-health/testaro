import { TableCaptionSummaryIdentical } from './table-caption-summary-identical';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('TableCaptionSummaryIdentical#', () => {

    let fakeDom;
    const selector = 'table[summary]';

    new TableCaptionSummaryIdentical().registerValidator();

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

    it('should return 2 reports when there are 2 tables with same summary and caption', () => {

      fakeDom.innerHTML = '<table summary="some text"><caption>some text</caption></table>' +
        '<table summary="some text"><caption>some text</caption></table>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('<code>summary</code> attribute and <code>&lt;caption&gt;</code> element have the same content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-caption-summary-identical');
      expect(Validator.getReport('report_1').message).toBe('<code>summary</code> attribute and <code>&lt;caption&gt;</code> element have the same content.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_1').ruleId).toBe('table-caption-summary-identical');
    });

    it('should return 1 report when there is table with same summary and caption', () => {

      fakeDom.innerHTML = '<table summary="some text"><caption>some text</caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('<code>summary</code> attribute and <code>&lt;caption&gt;</code> element have the same content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-caption-summary-identical');
    });

    it('should return 1 report when there is table with same summary and caption that are contain only spaces', () => {

      fakeDom.innerHTML = '<table summary="   "><caption>   </caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('<code>summary</code> attribute and <code>&lt;caption&gt;</code> element have the same content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-caption-summary-identical');
    });

    it('should return 1 report when there is table with same summary and caption that has empty values', () => {

      fakeDom.innerHTML = '<table summary=""><caption></caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('<code>summary</code> attribute and <code>&lt;caption&gt;</code> element have the same content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-caption-summary-identical');
    });

    it('should return 1 report when there is table with same summary and caption that are empty', () => {

      fakeDom.innerHTML = '<table summary><caption></caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('<code>summary</code> attribute and <code>&lt;caption&gt;</code> element have the same content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-caption-summary-identical');
    });

    it('should return 1 report when there is table with same summary and caption with child element with same text', () => {

      fakeDom.innerHTML = '<table summary="text"><caption><p>text</p></caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('<code>summary</code> attribute and <code>&lt;caption&gt;</code> element have the same content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-caption-summary-identical');
    });

    it('should return 1 report when there is table with same summary and caption with empty child element', () => {

      fakeDom.innerHTML = '<table summary="text"><caption>text<div></div></caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('<code>summary</code> attribute and <code>&lt;caption&gt;</code> element have the same content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-caption-summary-identical');
    });

    it('should return no report when there is table with different summary and caption with empty child element', () => {

      fakeDom.innerHTML = '<table summary="text"><caption>text1<div></div></caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is table with different summary and caption with non-empty child element', () => {

      fakeDom.innerHTML = '<table summary="text"><caption><div>text1</div></caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is table with different summary and caption', () => {

      fakeDom.innerHTML = '<table summary="text1"><caption>text</caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is table with only summary', () => {

      fakeDom.innerHTML = '<table summary="text1"></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is table with only caption', () => {

      fakeDom.innerHTML = '<table><caption>text</caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is table without summary and caption', () => {

      fakeDom.innerHTML = '<table></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableCaptionSummaryIdentical().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
