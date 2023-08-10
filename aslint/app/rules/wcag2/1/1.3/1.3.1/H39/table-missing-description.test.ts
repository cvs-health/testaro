import { TableMissingDescription } from './table-missing-description';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('TableMissingDescription#', () => {

    let fakeDom;
    const selector = 'table';

    new TableMissingDescription().registerValidator();

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

    it('should return 1 report when there is a table without caption, without aria-labelledby and without aria-describedby', () => {
      fakeDom.innerHTML = '<table></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('<code>&lt;caption&gt;</code> has not been defined on table.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-missing-description');
    });

    it('should return 1 report when there is a table without caption and empty aria-labelledby', () => {

      fakeDom.innerHTML = '<table aria-labelledby></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The table has defined attribute <code>aria-labelledby</code>, but it\'s empty. It should have defined one or more element IDs, which refer to elements that have the text needed for labeling.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-missing-description');
    });

    it('should return 1 report when there is a table without caption and aria-describedby=""', () => {

      fakeDom.innerHTML = '<table aria-describedby=""></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The table has defined attribute <code>aria-describedby</code>, but it\'s empty. It should have defined one or more element IDs, which refer to elements that have the text needed for labeling.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-missing-description');
    });

    it('should return 1 report when there is a table without caption and aria-labelledby=""', () => {

      fakeDom.innerHTML = '<table aria-labelledby=""></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The table has defined attribute <code>aria-labelledby</code>, but it\'s empty. It should have defined one or more element IDs, which refer to elements that have the text needed for labeling.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-missing-description');
    });

    it('should return 1 report when there is a table with aria-describedby that contains references to non-existing elements', () => {
      fakeDom.innerHTML = '<p id="exampleLabel">Table description</p><table aria-describedby="exampleLabel nonExistsId"></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>aria-describedby</code> contains associated elements that does not exists. Following elements with attribute <code>id</code> are missing: <code>nonExistsId</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-missing-description');
    });

    it('should return 1 report when there is a table with aria-labelledby that contains references to non-existing elements', () => {

      fakeDom.innerHTML = '<p id="exampleLabel">Table description</p><table aria-labelledby="exampleLabel nonExistsId"></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Attribute <code>aria-labelledby</code> contains associated elements that does not exists. Following elements with attribute <code>id</code> are missing: <code>nonExistsId</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('table');
      expect(Validator.getReport('report_0').ruleId).toBe('table-missing-description');
    });

    it('should return no report when there is a table with filled caption', () => {
      fakeDom.innerHTML = '<table><caption>Example caption</caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is a table with caption that contains only whitespaces', () => {
      fakeDom.innerHTML = '<table><caption>   </caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('<code>&lt;caption&gt;</code> is defined, but there is no content defined there. It contains only:    ');
    });

    it('should return no report when there is a table with caption and span', () => {

      fakeDom.innerHTML = '<table><caption><span>Help</span></caption></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is a table without caption and referenced elements specified in aria-labelledby', () => {
      fakeDom.innerHTML = '<p id="captionDescription">Description</p><table aria-labelledby="captionDescription"></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is table without caption, but contains aria-describedby with existsing referenced elements', () => {
      fakeDom.innerHTML = '<p id="captionDescription">Description</p><table aria-describedby="captionDescription"></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is table without caption but with summary', () => {
      fakeDom.innerHTML = '<table summary="Some summary"></table>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLTableElement[];

      new TableMissingDescription().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
