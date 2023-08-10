import { AriaRoleDialog } from './aria-role-dialog';
import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';

describe('Rules', () => {

  describe('AriaRoleDialog', () => {

    let fakeDom;
    const selector = '[role="dialog"], [role="alertdialog"]';

    new AriaRoleDialog().registerValidator();

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

    it('should return no report when there is an element with role="dialog" and aria-label', () => {
      fakeDom.innerHTML = '<div role="dialog" aria-label="name"></div>';

      const nodes: Element[] = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaRoleDialog().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is an element with role="dialog" and aria-label=""', () => {
      fakeDom.innerHTML = '<div role="dialog" aria-label=""></div>';

      const nodes: Element[] = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaRoleDialog().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').ruleId).toBe('aria-role-dialog');
      expect(Validator.getReport('report_0').message).toBe('Element with <code>role&#x3D;&quot;dialog&quot;</code> attribute has no accessible name because attribute <code>aria-label</code> has no content (it\'s empty).');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
    });

    it('should return 1 report when there is an element with role="dialog" and title=""', () => {
      fakeDom.innerHTML = '<div role="dialog" title=""></div>';

      const nodes: Element[] = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaRoleDialog().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').ruleId).toBe('aria-role-dialog');
      expect(Validator.getReport('report_0').message).toBe('Element with <code>role&#x3D;&quot;dialog&quot;</code> attribute has no accessible name because attribute <code>title</code> has no content (it\'s empty).');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
    });

    it('should return 1 report when there is an element with role="dialog" without any accesible name', () => {
      fakeDom.innerHTML = '<div role="dialog"></div>';

      const nodes: Element[] = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaRoleDialog().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').ruleId).toBe('aria-role-dialog');
      expect(Validator.getReport('report_0').message).toBe('Element with <code>role&#x3D;&quot;dialog&quot;</code> attribute has no accessible name.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
    });

    it('should return 1 report when there is an element with role="alertdialog" without any accesible name', () => {
      fakeDom.innerHTML = '<div role="alertdialog"></div>';

      const nodes: Element[] = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AriaRoleDialog().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').ruleId).toBe('aria-role-dialog');
      expect(Validator.getReport('report_0').message).toBe('Element with <code>role&#x3D;&quot;alertdialog&quot;</code> attribute has no accessible name.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
    });

  });

});
