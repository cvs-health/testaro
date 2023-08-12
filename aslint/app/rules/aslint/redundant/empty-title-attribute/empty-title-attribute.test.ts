import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';
import { EmptyTitleAttribute } from './empty-title-attribute';

describe('Rules', () => {

  describe('EmptyTitleAttribute', () => {

    const selector: string = `[title]${[
      ':not(img)',
      ':not(html)',
      ':not(head)',
      ':not(title)',
      ':not(body)',
      ':not(link)',
      ':not(meta)',
      ':not(title)',
      ':not(style)',
      ':not(script)',
      ':not(noscript)',
      ':not(iframe)',
      ':not(br)',
      ':not(hr)'
    ].join('')}`;

    let fakeDom;

    new EmptyTitleAttribute().registerValidator();

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

    it('should return one report when there is an element with defined an attribute title with an empty value', () => {
      fakeDom.innerHTML = '<div title="">test</div>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new EmptyTitleAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have an attribute <code>title</code> with an empty content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_0').ruleId).toBe('empty-title-attribute');
    });

    it('should return one report when there is an element with defined an attribute title with an empty value (only spaces)', () => {
      fakeDom.innerHTML = '<div title="    ">test</div>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new EmptyTitleAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have an attribute <code>title</code> with an empty content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_0').ruleId).toBe('empty-title-attribute');
    });

    it('should return no reports when there is an element with attribute title and non-empty value', () => {
      fakeDom.innerHTML = '<div title="some title">test</div>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new EmptyTitleAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
