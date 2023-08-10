import { ContentEditableMissingAttributes } from './content-editable-missing-attributes';
import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';

describe('Rules', () => {

  describe('#content-editable-missing-attributes', () => {

    let fakeDom;

    new ContentEditableMissingAttributes().registerValidator();

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

    it('should return 3 reports when there is an element with attribute [contenteditable] only', () => {
      fakeDom.innerHTML = '<p contenteditable="true"></p>';

      const nodes = DomUtility.querySelectorAllExclude('[contenteditable]', fakeDom);

      new ContentEditableMissingAttributes().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(3);

      expect(Validator.getReport('report_0').message).toBe('Missing attribute <code>role=\'textbox\'</code> on <code>&lt;p contenteditable&#x3D;&quot;true&quot;&gt;&lt;&#x2F;p&gt;</code>');
      expect(Validator.getReport('report_1').message).toBe('Missing attribute <code>aria-multiline=\'true\'</code> on <code>&lt;p contenteditable&#x3D;&quot;true&quot;&gt;&lt;&#x2F;p&gt;</code>');
      expect(Validator.getReport('report_2').message).toBe('Missing attribute <code>aria-labelledby</code> or <code>aria-label</code> on <code>&lt;p contenteditable&#x3D;&quot;true&quot;&gt;&lt;&#x2F;p&gt;</code>');
    });

    it('should return 2 reports when there is an element with attribute [contenteditable] and defined attribute aria-label', () => {
      fakeDom.innerHTML = '<p contenteditable="true" aria-label="test"></p><span id="test">test</span>';

      const nodes = DomUtility.querySelectorAllExclude('[contenteditable]', fakeDom);

      new ContentEditableMissingAttributes().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);

      expect(Validator.getReport('report_0').message).toBe('Missing attribute <code>role=\'textbox\'</code> on <code>&lt;p contenteditable&#x3D;&quot;true&quot; aria-label&#x3D;&quot;test&quot;&gt;&lt;&#x2F;p&gt;</code>');
      expect(Validator.getReport('report_1').message).toBe('Missing attribute <code>aria-multiline=\'true\'</code> on <code>&lt;p contenteditable&#x3D;&quot;true&quot; aria-label&#x3D;&quot;test&quot;&gt;&lt;&#x2F;p&gt;</code>');
    });

    it('should return 1 report for missing attribute role="textbox" when there is an element with attribute [contenteditable], defined attribute aria-label and aria-multiline', () => {
      fakeDom.innerHTML = '<p contenteditable="true" aria-label="test" aria-multiline="true"></p><span id="test">test</span>';

      const nodes = DomUtility.querySelectorAllExclude('[contenteditable]', fakeDom);

      new ContentEditableMissingAttributes().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);

      expect(Validator.getReport('report_0').message).toBe('Missing attribute <code>role=\'textbox\'</code> on <code>&lt;p contenteditable&#x3D;&quot;true&quot; aria-label&#x3D;&quot;test&quot; aria-multiline&#x3D;&quot;true&quot;&gt;&lt;&#x2F;p&gt;</code>');
    });

  });

});
