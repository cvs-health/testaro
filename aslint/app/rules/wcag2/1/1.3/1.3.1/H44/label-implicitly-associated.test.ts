import { LabelImplicitlyAssociated } from './label-implicitly-associated';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('LabelImplicitlyAssociated#', () => {

    let fakeDom;
    const selector = 'label';

    new LabelImplicitlyAssociated().registerValidator();

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

    it('should return 1 report when there is label without defined "for" attribute that contains more than 1 labelable child element', () => {

      fakeDom.innerHTML = '<label><textarea id="main">Example</textarea><input type="checkbox" id="main1">Label</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have implicitly associated <code>&lt;label&gt;&lt;&#x2F;label&gt;</code> attribute, but it contains more than one labelable elements. It should contains only one because activating label sets the foocus on the first labelable element. Note that implicit label has poor support in Voice Control AT.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-implicitly-associated');
    });

    it('should return no report when there is label without defined "for" attribute that contains any labelable (input) child element', () => {

      fakeDom.innerHTML = '<label><input type="text" id="main">Input</input></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label without defined "for" attribute that contains any labelable (keygen) child element', () => {

      fakeDom.innerHTML = '<label><keygen type="text" id="main">keygen</keygen></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label without defined "for" attribute that contains any labelable (meter) child element', () => {

      fakeDom.innerHTML = '<label><meter value="" id="main">meter</meter></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label without defined "for" attribute that contains any labelable (output) child element', () => {

      fakeDom.innerHTML = '<label><output id="main">output</output></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label without defined "for" attribute that contains any labelable (progress) child element', () => {

      fakeDom.innerHTML = '<label><progress id="main">progress</progress></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label without defined "for" attribute that contains any labelable (select) child element', () => {

      fakeDom.innerHTML = '<label><select id="main">select</select></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label without defined "for" attribute that contains any labelable (textarea) child element', () => {

      fakeDom.innerHTML = '<label><textarea id="main">Text</textarea>Example</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is label with input inside and "for" attribute with value ""', () => {

      fakeDom.innerHTML = '<label for=""><textarea id="main">Text</textarea></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have implicitly associated <code>&lt;label for&#x3D;&quot;&quot;&gt;&lt;&#x2F;label&gt;</code> attribute, but it contains only white spaces and therefore it\'s invalid. To implict associate label with labelable child element remove <code>for</code> attribute. Note that implicit label has poor support in Voice Control AT.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-implicitly-associated');
    });

    it('should return 1 report when there is label with input inside and empty "for" attribute value', () => {

      fakeDom.innerHTML = '<label for><textarea id="main">Text</textarea></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have implicitly associated <code>&lt;label for&#x3D;&quot;&quot;&gt;&lt;&#x2F;label&gt;</code> attribute, but it contains only white spaces and therefore it\'s invalid. To implict associate label with labelable child element remove <code>for</code> attribute. Note that implicit label has poor support in Voice Control AT.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-implicitly-associated');
    });

    it('should return no report when label contains attribute "for" with non-whitespaces', () => {

      fakeDom.innerHTML = '<label for="main"><textarea id="main">Text</textarea></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when label has no defined "for" attribute and contains labelable element', () => {

      fakeDom.innerHTML = '<label><area alt="" id="main">Text</area></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label with input inside and for="main1"', () => {

      fakeDom.innerHTML = '<label for="main1"><textarea id="main">Text</textarea></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is label with for="  " and contains labelable element as a child', () => {

      fakeDom.innerHTML = '<label for="   "><textarea id="main">Text</textarea></label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLLabelElement[];

      new LabelImplicitlyAssociated().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

  });
});
