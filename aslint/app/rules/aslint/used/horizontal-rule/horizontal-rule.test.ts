import { HorizontalRule } from './horizontal-rule';
import { Validator } from '../../../validator';
import { DomUtility } from '../../../utils/dom';

describe('Rules', () => {

  describe('HorizontalRule', () => {

    it('should indicate that class exists', () => {
      expect(HorizontalRule).toBeDefined();
    });

    const selector: string = `hr${[
      ':not([aria-hidden="true"])',
      ':not([role="presentation"])'
    ].join('')}`;

    let fakeDom;

    new HorizontalRule().registerValidator();

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

    it('should return one report when there is an element with hr', () => {
      fakeDom.innerHTML = '<p>Text 1</p><hr/><p>Text 2</p>';
      const nodes: HTMLHRElement[] = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHRElement[];

      new HorizontalRule().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The <code>&lt;hr&gt;</code> element adds extra <q>noise</q> and can be confusing. For example VoiceOver reads it as <q>dimmed collapsed on top, horizontal separator</q>, Windows Narrator reads it as <q>end of line</q>. A better option is to replace <code>&lt;hr&gt;</code> with <code>&lt;div&gt;</code> and use CSS for styling. Alternatively, <code>aria-hidden=\'true\'</code> or <code>role=\'presentation\'</code> can be applied to the <code>&lt;hr&gt;</code> element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('hr');
      expect(Validator.getReport('report_0').ruleId).toBe('horizontal-rule');
    });

    it('should return no reports when there is no elements with hr', () => {
      fakeDom.innerHTML = '<p>Text 1</p>hr<p>Text 2</p>';
      const nodes: HTMLHRElement[] = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHRElement[];

      new HorizontalRule().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is an element hr, but with attribue aria-hidden="true" or role="presentation"', () => {
      fakeDom.innerHTML = '<p>Text 1</p><hr aria-hidden="true"/><hr role="presentation"/><p>Text 2</p>';
      const nodes: HTMLHRElement[] = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLHRElement[];

      new HorizontalRule().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
