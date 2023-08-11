import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';
import { CapitalLettersWords } from './capital-letters-words';

describe('Rules', () => {

  describe('CapitalLettersWords', () => {

    it('should indicate that class exists', () => {
      expect(CapitalLettersWords).toBeDefined();
    });

    const selector: string = `*${[
      ':root',
      'head',
      'style',
      'script',
      'meta',
      'link',
      'br',
      'hr',
      'object',
      'path',
      'g',
      'filter',
      'img',
      'input',
      'iframe',
      'code',
      ':empty'
    ].map((i: string): string => {
      return `:not(${i})`;
    }).join('')}`;

    let fakeDom;

    new CapitalLettersWords().registerValidator();

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

    it('should return no report when text does not contains words in capital letters', () => {
      fakeDom.innerHTML = '<p>Text contains no capital letters</p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLParagraphElement[];

      new CapitalLettersWords().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when text contains words in capital letters transformed through CSS text-transform', () => {
      fakeDom.innerHTML = '<p style="text-transform: uppercase;">capital letters</p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLParagraphElement[];

      new CapitalLettersWords().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Element have a text <q>CAPITAL LETTERS</q> that contains words in upper case. <strong>Note</strong>: the text is transformed using <code>(text-transform: uppercase)</code>. Unless you are dealing with an acronym, there should not be any content in all caps. Some screen readers will announce the capital letters separately (like an acronym) or otherwise misleadingly emphasise the capital letters.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
    });

    it('should return 1 report when text contains words in capital letters', () => {
      fakeDom.innerHTML = '<p>Text contains CAPITAL LETTERS</p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLParagraphElement[];

      new CapitalLettersWords().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Element have a text that contains words in upper case. Unless you are dealing with an acronym, there should not be any content in all caps. Some screen readers will announce the capital letters separately (like an acronym) or otherwise misleadingly emphasise the capital letters.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
    });

    it('should return 1 report when element have an attribute title with text that contains words in capital letters', () => {
      fakeDom.innerHTML = '<p title="CAPITAL LETTERS">Example text</p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLParagraphElement[];

      new CapitalLettersWords().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This element has a <code>title</code> attribute that contains words in upper case. Unless you are dealing with an acronym, there should not be any content in all caps. Some screen readers will announce the capital letters separately (like an acronym) or otherwise misleadingly emphasise the capital letters.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
    });

    it('should return 1 report when element have an attribute title and content with text that contains words in capital letters', () => {
      fakeDom.innerHTML = '<p title="CAPITAL LETTERS">Example text WITH CAPITAL LETTERS</p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLParagraphElement[];

      new CapitalLettersWords().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Element have a text and has a <code>title</code> attribute that contains words in upper case. Unless you are dealing with an acronym, there should not be any content in all caps. Some screen readers will announce the capital letters separately (like an acronym) or otherwise misleadingly emphasise the capital letters.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
    });

  });
});
