import { LabelVisuallyHiddenOnly } from './label-visually-hidden-only';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('LabelVisuallyHiddenOnly#', () => {

    let fakeDom;
    const selector = 'label[for]';

    new LabelVisuallyHiddenOnly().registerValidator();

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

    it('should return 1 report when aria-label="Aria label text" and style="opacity: 0.09"', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" aria-label="Aria label text" style="opacity: 0.09">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This associated <code>&lt;label&gt;</code> is visually hidden, but available for assistive technologies, and therefore it is recommended to provide additional info, e.g. a custom title.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-visually-hidden-only');
    });

    it('should return 1 report when aria-label="   " and style="opacity: 0.09"', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" aria-label="   " style="opacity: 0.09">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This associated <code>&lt;label&gt;</code> is visually hidden, but available for assistive technologies, and therefore it is recommended to provide additional info, e.g. a custom title.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-visually-hidden-only');
    });

    it('should return 1 report when style="opacity: 0.09"', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" style="opacity: 0.09">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This associated <code>&lt;label&gt;</code> is visually hidden, but available for assistive technologies, and therefore it is recommended to provide additional info, e.g. a custom title.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-visually-hidden-only');
    });

    it('should return 1 report when style="visibility: collapse"', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" style="visibility: collapse">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This associated <code>&lt;label&gt;</code> is visually hidden, but available for assistive technologies, and therefore it is recommended to provide additional info, e.g. a custom title.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-visually-hidden-only');
    });

    it('should return 1 report when there is label with aria-label="" and style="opacity: 0.09"', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" aria-label="" style="opacity: 0.09">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('This associated <code>&lt;label&gt;</code> is visually hidden, but available for assistive technologies, and therefore it is recommended to provide additional info, e.g. a custom title.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('label');
      expect(Validator.getReport('report_0').ruleId).toBe('label-visually-hidden-only');
    });

    it('should return no reports when there is label with style="display: none"', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" style="display: none">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is label with style="visibility: hidden"', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" style="visibility: hidden">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is label with aria-label', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" aria-labelledby="m">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is label with aria-labelledby="t"', () => {
      fakeDom.innerHTML = '<input id="m"><label for="m" aria-labelledby="t" style="text-indent: -200em">William Shakespeare</label>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new LabelVisuallyHiddenOnly().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
