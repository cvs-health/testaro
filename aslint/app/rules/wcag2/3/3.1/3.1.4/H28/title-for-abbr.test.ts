import { TitleForAbbr } from './title-for-abbr';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('TitleForAbbr#', () => {

    let fakeDom;
    const selector = 'abbr';

    new TitleForAbbr().registerValidator();

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

    it('should return 1 report when abbr title=""', () => {
      fakeDom.innerHTML = '<p>Welcome to the <abbr title="">WWW</abbr>!</p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TitleForAbbr().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The <code>title</code> content for the abbreviation should not be empty.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('abbr');
      expect(Validator.getReport('report_0').ruleId).toBe('title-for-abbr');
    });

    it('should return 1 report when <abbr title>', () => {
      fakeDom.innerHTML = '<p>Welcome to the <abbr title>WWW</abbr>!</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TitleForAbbr().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The <code>title</code> content for the abbreviation should not be empty.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('abbr');
      expect(Validator.getReport('report_0').ruleId).toBe('title-for-abbr');
    });

    it('should return 1 report when abbr title contains spaces only', () => {
      fakeDom.innerHTML = '<p>Welcome to the <abbr title="    ">WWW</abbr>!</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TitleForAbbr().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The <code>title</code> content for the abbreviation should not be empty.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('abbr');
      expect(Validator.getReport('report_0').ruleId).toBe('title-for-abbr');
    });

    it('should return 1 report when abbr title does not exist', () => {
      fakeDom.innerHTML = '<p>Welcome to the <abbr>WWW</abbr>!</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TitleForAbbr().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have not provided a <code>title</code> that defines the abbreviation.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('abbr');
      expect(Validator.getReport('report_0').ruleId).toBe('title-for-abbr');
    });

    it('should return no reports when abbr title="World Wide Web"', () => {
      fakeDom.innerHTML = '<p>Welcome to the <abbr title="World Wide Web">WWW</abbr>!</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TitleForAbbr().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
