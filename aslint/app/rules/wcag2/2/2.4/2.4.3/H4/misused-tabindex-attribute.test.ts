import { MisusedTabindexAttribute } from './misused-tabindex-attribute';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('MisusedTabindexAttribute#', () => {

    let fakeDom;
    const selector = '[tabindex]';

    new MisusedTabindexAttribute().registerValidator();

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

    it('should return 1 report when there is 1 element with tabindex = 0 in a', () => {
      fakeDom.innerHTML = '<a href="xxx" tabindex = "0">First link in list</a>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MisusedTabindexAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>tabindex="tabindex&#x3D;&quot;0&quot;"</code> not to be defined.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('misused-tabindex-attribute');
    });

    it('should return 1 report when there is 1 element with tabindex = 0 in link', () => {
      fakeDom.innerHTML = '<link href="xxx" tabindex = "0">First link in list</link>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MisusedTabindexAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>tabindex="tabindex&#x3D;&quot;0&quot;"</code> not to be defined.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('link');
      expect(Validator.getReport('report_0').ruleId).toBe('misused-tabindex-attribute');
    });

    it('should return 1 report when there is 1 element with tabindex = 0 in button', () => {
      fakeDom.innerHTML = '<button tabindex = "0">button</button>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MisusedTabindexAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>tabindex="tabindex&#x3D;&quot;0&quot;"</code> not to be defined.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
      expect(Validator.getReport('report_0').ruleId).toBe('misused-tabindex-attribute');
    });

    it('should return 1 report when there is 1 element with tabindex = 0 in input', () => {
      fakeDom.innerHTML = '<input type="text" tabindex = "0">text</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MisusedTabindexAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>tabindex="tabindex&#x3D;&quot;0&quot;"</code> not to be defined.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('misused-tabindex-attribute');
    });

    it('should return 1 report when there is 1 element with tabindex = 0 in select', () => {
      fakeDom.innerHTML = '<select tabindex = "0">select</select>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MisusedTabindexAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>tabindex="tabindex&#x3D;&quot;0&quot;"</code> not to be defined.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('select');
      expect(Validator.getReport('report_0').ruleId).toBe('misused-tabindex-attribute');
    });

    it('should return 1 report when there is 1 element with tabindex=0 in textarea', () => {
      fakeDom.innerHTML = '<textarea tabindex="0">textarea</textarea>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MisusedTabindexAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>tabindex="tabindex&#x3D;&quot;0&quot;"</code> not to be defined.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('textarea');
      expect(Validator.getReport('report_0').ruleId).toBe('misused-tabindex-attribute');
    });

    it('should return no reports when tabindex=""', () => {
      fakeDom.innerHTML = '<a href="xxx" tabindex="">First link in list</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MisusedTabindexAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when tabindex does not exist', () => {
      fakeDom.innerHTML = '<a href="xxx">First link in list</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new MisusedTabindexAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
