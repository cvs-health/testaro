import { TextColorConveyInformation } from './text-color-convey-information';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { TranslateService } from '../../../../../../services/translate';

describe('Rules', () => {

  describe('TextColorConveyInformation#', () => {
    let fakeDom;

    const selector = `*${[
      ':not(:root)',
      ':not(head)',
      ':not(style)',
      ':not(script)',
      ':not(meta)',
      ':not(link)',
      ':not(br)',
      ':not(hr)',
      ':not(object)',
      ':not(path)',
      ':not(g)',
      ':not(filter)',
      ':not(img)',
      ':not(input)',
      ':not(iframe)',
      ':not(code)',
      ':not(:empty)'
    ].join('')}`;

    new TextColorConveyInformation().registerValidator();

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

    it('should return no reports when there is no mention of any color name', () => {
      fakeDom.innerHTML = '<p>Some mention of a <span><b>non existing</b></span> color</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TextColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is a mention of green color within <p>', () => {
      fakeDom.innerHTML = '<p>Some mention of a Green color</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TextColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Check that the information conveyed by colors <code>Green</code> is also available in text and that the text is not conditional content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('text-color-convey-information');
    });

    it('should return 1 report when there is a mention of compound color with one known component', () => {
      fakeDom.innerHTML = '<p>Some mention of a bluish-green color</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TextColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Check that the information conveyed by colors <code>green</code> is also available in text and that the text is not conditional content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('text-color-convey-information');
    });

    it('should return 1 report when there is a mention of multiple colors', () => {
      fakeDom.innerHTML = '<p>Some mention of a color green and blue.</p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new TextColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Check that the information conveyed by colors <code>green, blue</code> is also available in text and that the text is not conditional content.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('text-color-convey-information');
    });

  });
});
