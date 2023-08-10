import { LabelInappropriateAssociation } from './label-inappropriate-association';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('LabelInappropriateAssociation#', () => {

    let fakeDom;
    const selector = 'label';

    new LabelInappropriateAssociation().registerValidator();

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

      fakeDom.innerHTML = '<object type="text" id="main">AREA</object><label for="main">Label for area</label>' +
        '<label for="main1">Label for non-exists</label>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> not to be associated with non-form control.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-inappropriate-association');
      expect(Validator.getReport('report_1').message).toBe('Missing defined associated form control for <code>&lt;label for&#x3D;&quot;main1&quot;&gt;</code>');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_1').ruleId).toBe('label-inappropriate-association');
    });

    it('should return 1 report when there is label for non-existing id', () => {

      fakeDom.innerHTML = '<input type="text" id="main">Text</input><label for="main1">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Missing defined associated form control for <code>&lt;label for&#x3D;&quot;main1&quot;&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-inappropriate-association');
    });

    it('should return 1 report when there is label for non-existing id', () => {

      fakeDom.innerHTML = '<area type="text" id="main">AREA</area><label for="main">Label for area</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> not to be associated with non-form control.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-inappropriate-association');
    });

    it('should return 1 report when there is label empty for', () => {

      fakeDom.innerHTML = '<input type="text" id="main">Text</input><label for="">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

    it('should return 1 report when there is label empty for with no value', () => {
      fakeDom.innerHTML = '<input type="text" id="main">Text</input><label for>Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

    it('should return no report when is label without for', () => {

      fakeDom.innerHTML = '<input type="text" id="main">Text</input><label>Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when is label for correct input', () => {

      fakeDom.innerHTML = '<input type="text" id="main">input</input><label for="main">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when is label for correct keygen', () => {

      fakeDom.innerHTML = '<keygen id="main">keygen</keygen><label for="main">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when is label for correct meter', () => {
      fakeDom.innerHTML = '<meter value="1" id="main">meter</meter><label for="main">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when is label for correct output', () => {

      fakeDom.innerHTML = '<output id="main">output</output><label for="main">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when is label for correct progress', () => {

      fakeDom.innerHTML = '<progress id="main">progress</progress><label for="main">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when is label for correct select', () => {

      fakeDom.innerHTML = '<select id="main">select</select><label for="main">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when is label for correct textarea', () => {

      fakeDom.innerHTML = '<textarea id="main">textarea</textarea><label for="main">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelInappropriateAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
