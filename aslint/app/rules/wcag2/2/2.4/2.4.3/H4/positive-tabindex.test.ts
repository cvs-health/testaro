import { PositiveTabindex } from './positive-tabindex';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('PositiveTabindex#', () => {

    let fakeDom;
    const selector = '[tabindex]';

    new PositiveTabindex().registerValidator();

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

    it('should return 2 reports when there is few elements with tabindex > 0', () => {
      fakeDom.innerHTML = ' <a href="xxx" tabindex = "1">First link in list</a><br/><a href="xxx" tabindex = "2">Second link in list</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new PositiveTabindex().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Positive <code>tabindex="1"</code> should not be used. Outside of very specific corner cases, a tabindex should not be given a positive integer value. Users who use keyboards to interact with the web expect a web document to be navigable in sequential order, starting at the top left (or right depending on language of the document) and going in order from there.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('positive-tabindex');
      expect(Validator.getReport('report_1').message).toBe('Positive <code>tabindex="2"</code> should not be used. Outside of very specific corner cases, a tabindex should not be given a positive integer value. Users who use keyboards to interact with the web expect a web document to be navigable in sequential order, starting at the top left (or right depending on language of the document) and going in order from there.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_1').ruleId).toBe('positive-tabindex');
    });

    it('should return 1 report when there is 1 element with tabindex > 0', () => {
      fakeDom.innerHTML = '<a href="xxx" tabindex = "1">First link in list</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new PositiveTabindex().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Positive <code>tabindex="1"</code> should not be used. Outside of very specific corner cases, a tabindex should not be given a positive integer value. Users who use keyboards to interact with the web expect a web document to be navigable in sequential order, starting at the top left (or right depending on language of the document) and going in order from there.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('positive-tabindex');
    });

    it('should return no reports when tabindex = "0"', () => {
      fakeDom.innerHTML = '<a href="xxx" tabindex = "0">First link in list</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new PositiveTabindex().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when tabindex = ""', () => {
      fakeDom.innerHTML = '<a href="xxx" tabindex = "">First link in list</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new PositiveTabindex().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when tabindex is empty', () => {
      fakeDom.innerHTML = '<a href="xxx" tabindex>First link in list</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new PositiveTabindex().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when tabindex does not exist', () => {
      fakeDom.innerHTML = '<a href="xxx">First link in list</a>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new PositiveTabindex().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
