import { EmptyLabelElement } from './empty-label-element';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('EmptyLabelElement#', () => {

    let fakeDom;
    const selector = 'label';

    new EmptyLabelElement().registerValidator();

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

    it('should return 2 reports when there are 2 labels with incorrect data', () => {
      fakeDom.innerHTML = '<input type="text" id="main">input</input><label for="main"></label><input type="text" id="main1">input</input><label for="main1"><div></div></label>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new EmptyLabelElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('The label has no content <code>&lt;label for&#x3D;&quot;main&quot;&gt;&lt;&#x2F;label&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('empty-label-element');
      expect(Validator.getReport('report_1').message).toBe('The label has no content <code>&lt;label for&#x3D;&quot;main1&quot;&gt;&lt;&#x2F;label&gt;</code>');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_1').ruleId).toBe('empty-label-element');
    });

    it('should return 1 report when there is no label content', () => {
      fakeDom.innerHTML = '<input type="text" id="main">input</input><label for="main"></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new EmptyLabelElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The label has no content <code>&lt;label for&#x3D;&quot;main&quot;&gt;&lt;&#x2F;label&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('empty-label-element');
    });

    it('should return 1 report when there is no label content in child element', () => {
      fakeDom.innerHTML = '<input type="text" id="main1">input</input><label for="main"><p></p></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new EmptyLabelElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The label has no content <code>&lt;label for&#x3D;&quot;main&quot;&gt;&lt;&#x2F;label&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('empty-label-element');
    });

    it('should return no report when there is label content only with spaces', () => {
      fakeDom.innerHTML = '<input type="text" id="main">input</input><label for="main">   </label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new EmptyLabelElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label content', () => {
      fakeDom.innerHTML = '<input type="text" id="main">input</input><label for="main">Content here</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new EmptyLabelElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label content in child', () => {
      fakeDom.innerHTML = '<input type="text" id="main">input</input><label for="main"><p></p><div>Content here</div></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new EmptyLabelElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label content and empty child', () => {
      fakeDom.innerHTML = '<input type="text" id="main">input</input><label for="main"><p></p>Content here</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new EmptyLabelElement().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
