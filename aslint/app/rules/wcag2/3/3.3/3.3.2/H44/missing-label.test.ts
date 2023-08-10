import { MissingLabel } from './missing-label';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';

describe('Rule', () => {

  describe(TextUtility.convertUnderscoresToDashes($accessibilityAuditRules.missing_label), () => {

    let fakeDom;

    new MissingLabel().registerValidator();

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

    it('should return one report when there is label for non-existing id', () => {
      fakeDom.innerHTML = '<input type="text"/><label for="main">Does not exist</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>id</code> to be defined on element <code>&lt;input type&#x3D;&quot;text&quot;&gt;</code> to associate with appropriate <code>&lt;label for&#x3D;&quot;[id]&quot;&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is label for incorrect id', () => {

      fakeDom.innerHTML = '<input type="text" id="main1"/><label for="main">Does not exist</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main1&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is label for id with spaces', () => {
      fakeDom.innerHTML = '<input type="text" id="  main "/><label for="main">Spaces</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;  main &quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is no label for input type="text"', () => {
      fakeDom.innerHTML = '<input type="text" id="main"/>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is no label for input type="checkbox"', () => {
      fakeDom.innerHTML = '<input type="checkbox" id="main"/>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is no label for input type="radio"', () => {
      fakeDom.innerHTML = '<input type="radio" id="main"/>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is no label for input type="file"', () => {
      fakeDom.innerHTML = '<input type="file" id="main" style="display: block; width: 10px;"/>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is no label for input type="password"', () => {
      fakeDom.innerHTML = '<input type="password" id="main"/>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is no label for textarea', () => {
      fakeDom.innerHTML = '<textarea id="main"/>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('textarea');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is no label for select', () => {
      fakeDom.innerHTML = '<select id="main"/>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('select');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return one report when there is no label for output', () => {
      fakeDom.innerHTML = '<output id="main"/>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected element <code>&lt;label for&#x3D;&quot;main&quot;&gt;</code> to be defined for this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('output');
      expect(Validator.getReport('report_0').ruleId).toBe('missing-label');
    });

    it('should return no reports when there is label for input type="reset"', () => {
      fakeDom.innerHTML = '<input type="reset" id="main"><label for="main">input type="reset"</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is label for input type="image"', () => {
      fakeDom.innerHTML = '<input type="image" id="main"><label for="main">input type="image"</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is label for input type="hidden"', () => {
      fakeDom.innerHTML = '<input type="hidden" id="main"><label for="main>">input type="hidden"</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is label for button', () => {
      fakeDom.innerHTML = '<button id="main"><label for="main>">button</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there no label for button', () => {
      fakeDom.innerHTML = '<button id="main">';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return one report when there is label for input type="text"', () => {
      fakeDom.innerHTML = '<input type="text" id="main"/><label for="main">input type="text"</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return one report when there is label for input type="checkbox"', () => {
      fakeDom.innerHTML = '<input type="checkbox" id="main"/><label for="main">input type="checkbox"</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return one report when there is label for input type="radio"', () => {
      fakeDom.innerHTML = '<input type="radio" id="main"/><label for="main">input type="radio"</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is label for input type="file"', () => {
      fakeDom.innerHTML = '<input type="file" id="main"/><label for="main">input type="file"</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return one report when there is label for input type="password"', () => {
      fakeDom.innerHTML = '<input type="password" id="main"/><label for="main">input type="password"</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return one report when there is label for keygen', () => {
      fakeDom.innerHTML = '<keygen id="main"/><label for="main">keygen</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return one report when there is label for output', () => {
      fakeDom.innerHTML = '<output id="main"/><label for="main">output</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return one report when there is label for progress', () => {
      fakeDom.innerHTML = '<progress id="main"/><label for="main">progress</label>';

      new MissingLabel().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
