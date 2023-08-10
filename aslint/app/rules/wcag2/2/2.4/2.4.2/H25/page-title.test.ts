import { PageTitle } from './page-title';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('PageTitle#', () => {

    let fakeDom;
    const selector = document;

    new PageTitle().registerValidator();

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

    it('should return 1 report when there is no title', () => {
      const originalDocumentTitle: string = document.title;

      document.title = '';
      new PageTitle().validate([document]);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The page title is empty and therefore does not identify the contents or purpose of the Web page.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('title');
      expect(Validator.getReport('report_0').ruleId).toBe('page-title');

      document.title = originalDocumentTitle;
    });

    it('should return 1 report when there is a page title, but contains unclear description', () => {
      const originalDocumentTitle: string = document.title;

      document.title = 'Enter the title of your HTML document here';
      new PageTitle().validate([document]);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The page title <code>Enter the title of your HTML document here</code> does not identify the contents or purpose of the Web page.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('title');
      expect(Validator.getReport('report_0').ruleId).toBe('page-title');

      Validator.reset();
      document.title = 'Untitled Document';
      new PageTitle().validate([document]);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The page title <code>Untitled Document</code> does not identify the contents or purpose of the Web page.');

      Validator.reset();
      document.title = 'No Title';
      new PageTitle().validate([document]);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The page title <code>No Title</code> does not identify the contents or purpose of the Web page.');

      Validator.reset();
      document.title = 'Untitled Page';
      new PageTitle().validate([document]);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The page title <code>Untitled Page</code> does not identify the contents or purpose of the Web page.');

      Validator.reset();
      document.title = 'New Page 1';
      new PageTitle().validate([document]);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The page title <code>New Page 1</code> does not identify the contents or purpose of the Web page.');

      document.title = originalDocumentTitle;
    });

  });
});
