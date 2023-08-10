import { NoHeadings } from './no-headings';
import { Validator } from '../../../../../validator';
import { DomUtility } from '../../../../../utils/dom';

describe('Rules', () => {

  describe('NoHeadings', () => {

    let fakeDom;
    const selector = 'h1, h2, h3, h4, h5, h6';

    new NoHeadings().registerValidator();

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

    it('should return one report when there are no header content', () => {
      fakeDom.innerHTML = '<div></div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new NoHeadings().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have no defined headings <code>h1-h6</code>.');
      expect(Validator.getReport('report_0').node).toBe(null);
      expect(Validator.getReport('report_0').ruleId).toBe('no-headings');
    });

    it('should return no reports when h1 exists', () => {
      fakeDom.innerHTML = '<h1>H1</h1>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new NoHeadings().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when h2 exists', () => {
      fakeDom.innerHTML = '<h2>H2</h2>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new NoHeadings().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when h3 exists', () => {
      fakeDom.innerHTML = '<h3>H3</h3>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new NoHeadings().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when h4 exists', () => {
      fakeDom.innerHTML = '<h4>H4</h4>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new NoHeadings().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when h5 exists', () => {
      fakeDom.innerHTML = '<h5>H5</h5>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new NoHeadings().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when h6 exists', () => {
      fakeDom.innerHTML = '<h6>H6</h6>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new NoHeadings().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when h1,h2,h3,h4,h5,h6 exists', () => {
      fakeDom.innerHTML = '<h1>H1</h1><h2>H1</h2><h3>H1</h3><h4>H1</h4><h5>H1</h5><h6>H1</h6>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new NoHeadings().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
