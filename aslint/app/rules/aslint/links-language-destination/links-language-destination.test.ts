import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';
import { LinksLanguageDestination } from './links-language-destination';

describe('Rules', () => {

  describe('LinksLanguageDestination', () => {

    it('should indicate that class exists', () => {
      expect(LinksLanguageDestination).toBeDefined();
    });

    let fakeDom;

    new LinksLanguageDestination().registerValidator();

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

    it('should return no reports when there is an anchor element with url pointed within page base uri', () => {
      fakeDom.innerHTML = '<a href="http://localhost/example">example</a>';

      new LinksLanguageDestination().validate(Array.from(document.links));

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is an anchor element with url pointed outside of base uri', () => {
      fakeDom.innerHTML = '<a href="http://example.com/example">example</a>';

      new LinksLanguageDestination().validate(Array.from(document.links));

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Following url <code>http:&#x2F;&#x2F;example.com&#x2F;example</code> points to an external resource. If the content behind the link is in a different language then consider add some text or graphic to the link indicating that the target document is in another language.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('links-language-destination');
    });

  });
});
