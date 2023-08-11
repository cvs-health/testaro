import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';
import { HeadingsSiblingUnique } from './headings-sibling-unique';

describe('Rules', () => {

  describe('HeadingsSiblingUnique', () => {

    it('should indicate that class exists', () => {
      expect(HeadingsSiblingUnique).toBeDefined();
    });

    let fakeDom;

    new HeadingsSiblingUnique().registerValidator();

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

    it('should return 1 report when there are non-unique siblings headings', () => {
      fakeDom.innerHTML = '<h1>Test</h1><h1>Test</h1>';
      const nodes = DomUtility.querySelectorAllExclude('h1', fakeDom) as HTMLHeadingElement[];

      new HeadingsSiblingUnique().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('The accessible names of sibling heading elements of the same level are not unique. If section headings that share the same parent heading are not unique, users of assistive technologies will not be able to discern the differences among sibling sections of the web page. Same level <code>h1</code> and same description: <q>Test</q>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('h1');
      expect(Validator.getReport('report_0').ruleId).toBe('headings-sibling-unique');
    });

    it('should return no reports when two headings description are different', () => {
      fakeDom.innerHTML = '<h1>Test</h1><h1>Test 2</h1>';
      const nodes = DomUtility.querySelectorAllExclude('h1', fakeDom) as HTMLHeadingElement[];

      new HeadingsSiblingUnique().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
