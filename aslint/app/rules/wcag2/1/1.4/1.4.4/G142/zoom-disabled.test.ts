import { ZoomDisabled } from './zoom-disabled';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('ZoomDisabled#', () => {

    let fakeDom;
    const selector = 'meta:not([name="viewport"]):not([http-equiv="Content-Type"])';

    new ZoomDisabled().registerValidator();

    beforeEach(() => {
      fakeDom = document.createElement('meta');
      fakeDom.id = 'fakedom';
      document.head.appendChild(fakeDom);

      Validator.reset();
    });

    afterEach(() => {
      DomUtility.remove(document.getElementById('fakedom'));
      fakeDom = undefined;
    });

    it('should return 1 report when there is meta with user-scalable=no and maximum-scale=10', () => {
      fakeDom.content = 'user-scalable  = no, maximum-scale=10';
      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new ZoomDisabled().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>user-scalable=no, maximum-scale</code>. Remove parameters from the <code>content</code> attribute.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('zoom-disabled');
    });

    it('should return one report when there is meta with user-scalable  = no', () => {
      fakeDom.content = 'user-scalable  = no';
      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new ZoomDisabled().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>user-scalable=no</code>. Remove parameters from the <code>content</code> attribute.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('zoom-disabled');
    });

    it('should return one report when there is meta with user-scalable=0', () => {
      fakeDom.content = 'user-scalable=0';
      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new ZoomDisabled().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>user-scalable=0</code>. Remove parameters from the <code>content</code> attribute.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('zoom-disabled');
    });

    it('should return one report when there is meta with maximum-scale', () => {
      fakeDom.content = 'maximum-scale';
      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new ZoomDisabled().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>maximum-scale</code>. Remove parameters from the <code>content</code> attribute.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('zoom-disabled');
    });

    it('should return one report when there is meta with maximum-scale =  1', () => {
      fakeDom.content = 'maximum-scale =  1';
      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new ZoomDisabled().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>maximum-scale</code>. Remove parameters from the <code>content</code> attribute.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('zoom-disabled');
    });

    it('should return one report when there is meta with minimum-scale', () => {
      fakeDom.content = 'minimum-scale';
      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new ZoomDisabled().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>minimum-scale</code>. Remove parameters from the <code>content</code> attribute.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('zoom-disabled');
    });

    it('should return one report when there is meta with minimum-scale  =1', () => {
      fakeDom.content = 'minimum-scale  =1';
      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new ZoomDisabled().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>minimum-scale</code>. Remove parameters from the <code>content</code> attribute.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('zoom-disabled');
    });

    it('should return no reports when there is meta with no any restrictions', () => {
      fakeDom.content = 'minimum';
      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new ZoomDisabled().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
