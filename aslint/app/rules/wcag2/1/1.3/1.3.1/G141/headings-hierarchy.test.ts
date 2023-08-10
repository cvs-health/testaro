import { HeadingsHierarchy } from './headings-hierarchy';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('HeadingsHierarchy#', () => {

    let fakeDom;
    const selector = 'h1, h2, h3, h4, h5, h6';

    new HeadingsHierarchy().registerValidator();

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

    it('should return 1 report in case of h2-h1', () => {

      fakeDom.innerHTML = '<h2>H2</h2><h1>H1</h1>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h2&gt;H2&lt;&#x2F;h2&gt;</code> to be <code>&lt;h1&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h2');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
    });

    it('should return 1 report in case of h1-h3-h2', () => {

      fakeDom.innerHTML = '<h1>H1</h1><h3>H3</h3><h2>H2</h2>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h3&gt;H3&lt;&#x2F;h3&gt;</code> to be <code>&lt;h2&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h3');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
    });

    it('should return 2 reports in case of h2-h5-h2', () => {

      fakeDom.innerHTML = '<h2>H2</h2><h5>H5</h5><h2>H2</h2>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h2&gt;H2&lt;&#x2F;h2&gt;</code> to be <code>&lt;h1&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h2');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
      expect(Validator.getReport('report_1').message).toBe('Expected <code>&lt;h5&gt;H5&lt;&#x2F;h5&gt;</code> to be <code>&lt;h2&gt;</code>');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('h5');
      expect(Validator.getReport('report_1').ruleId).toBe('headings-hierarchy');
    });

    it('should return 1 report in case of h1-h2-h3-h4-h6-h5', () => {

      fakeDom.innerHTML = '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h6>h6</h6><h5>h5</h5>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h6&gt;h6&lt;&#x2F;h6&gt;</code> to be <code>&lt;h5&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h6');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
    });

    it('should return 1 report in case of div.h5-div.h1', () => {

      fakeDom.innerHTML = '<div><h5>H5</h5></div><div><h1>h1</h1></div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h5&gt;H5&lt;&#x2F;h5&gt;</code> to be <code>&lt;h1&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h5');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
    });

    it('should return 1 report in case of h1-h6', () => {

      fakeDom.innerHTML = '<h1>H1</h1><h6>H6</h6>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h6&gt;H6&lt;&#x2F;h6&gt;</code> to be <code>&lt;h2&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h6');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
    });

    it('should return 1 report in case of h1-h2-h5', () => {

      fakeDom.innerHTML = '<h1>H1</h1><h2>H2</h2><h5>H5</h5>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h5&gt;H5&lt;&#x2F;h5&gt;</code> to be <code>&lt;h3&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h5');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
    });

    it('should return 3 reports in case of h4-h4-h6', () => {

      fakeDom.innerHTML = '<h4>H4</h4><h4>H4</h4><h6>H6</h6>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(3);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h4&gt;H4&lt;&#x2F;h4&gt;</code> to be <code>&lt;h1&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h4');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
      expect(Validator.getReport('report_1').message).toBe('Expected <code>&lt;h4&gt;H4&lt;&#x2F;h4&gt;</code> to be <code>&lt;h2&gt;</code>');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('h4');
      expect(Validator.getReport('report_1').ruleId).toBe('headings-hierarchy');
      expect(Validator.getReport('report_2').message).toBe('Expected <code>&lt;h6&gt;H6&lt;&#x2F;h6&gt;</code> to be <code>&lt;h3&gt;</code>');
      expect(Validator.getReport('report_2').node.nodeName.toLowerCase()).toBe('h6');
      expect(Validator.getReport('report_2').ruleId).toBe('headings-hierarchy');
    });

    it('should return 1 report in case of h6', () => {

      fakeDom.innerHTML = '<h6>H6</h6>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;h6&gt;H6&lt;&#x2F;h6&gt;</code> to be <code>&lt;h1&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h6');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-hierarchy');
    });

    it('should return no report in case of h1-h1', () => {

      fakeDom.innerHTML = '<h1>H1</h1><h1>H1</h1>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report in case of h1-h2', () => {

      fakeDom.innerHTML = '<h1>H1</h1><h2>H2</h2>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report in case of h1-h2-h2-h3-h4-h5-h5-h6-h6', () => {

      fakeDom.innerHTML = '<h1>H1</h1><h2>H2</h2><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><h6>H6</h6>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should add expected tag to the report', () => {
      fakeDom.innerHTML = '<h1>H1</h1><h3>H3</h3><h2>H2</h2>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHeadingElement[];

      new HeadingsHierarchy().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').expected.tag).toBe('H2');
    });

  });
});
