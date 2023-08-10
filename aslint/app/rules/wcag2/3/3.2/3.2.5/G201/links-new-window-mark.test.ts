import { LinksNewWindowMark } from './links-new-window-mark';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('LinksNewWindowMark#', () => {

    let fakeDom;
    const selector = 'a';

    new LinksNewWindowMark().registerValidator();

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

    it('should return one report when target="_blank"', () => {
      fakeDom.innerHTML = '<a href="test.html" target="_blank" >';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This link should have a warning before automatically opening a new window or tab.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('links-new-window-mark');
    });

    it('should return two reports when 2 links with target="_blank"', () => {
      fakeDom.innerHTML = '<a href="test.html" target="_blank" ><a href="test.html" target="_blank" >';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('This link should have a warning before automatically opening a new window or tab.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('links-new-window-mark');
      expect(Validator.getReport('report_1').message).toBe('This link should have a warning before automatically opening a new window or tab.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_1').ruleId).toBe('links-new-window-mark');
    });

    it('should return no reports when target is _self', () => {
      fakeDom.innerHTML = '<a href="test.html" target="_self" >';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when target is _parent', () => {
      fakeDom.innerHTML = '<a href="test.html" target="_parent" >';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when target is _top', () => {
      fakeDom.innerHTML = '<a href="test.html" target=_top >';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when target is target=""', () => {
      fakeDom.innerHTML = '<a href="test.html" target="" >';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when target is target="    "', () => {
      fakeDom.innerHTML = '<a href="test.html" target="    " >';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when target is empty', () => {
      fakeDom.innerHTML = '<a href="test.html" target >';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when target does not exist', () => {
      fakeDom.innerHTML = '<a href="test.html">';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

      new LinksNewWindowMark().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
