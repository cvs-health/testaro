import { ElementsNotAllowed } from './elements-not-allowed-in-head';
import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';

describe('Rules', () => {

  describe('ElementsNotAllowed#', () => {

    let fakeDom;
    const VALID_ELEMENTS: string[] = [':not(base)', ':not(link)', ':not(meta)', ':not(script)', ':not(style)', ':not(title)', ':not(noscript)', ':not(template)'];
    const selector = `head *${VALID_ELEMENTS.join('')}`;

    new ElementsNotAllowed().registerValidator();

    beforeEach(() => {
      Validator.reset();
    });

    afterEach(() => {
      DomUtility.remove(document.getElementById('headfakedom'));
      fakeDom = undefined;
    });

    it('should return one report when there is an element not supposed to be in head block', () => {
      fakeDom = document.createElement('div');
      fakeDom.id = 'headfakedom';
      document.head.appendChild(fakeDom);

      const nodes = DomUtility.querySelectorAllExclude(selector);

      new ElementsNotAllowed().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>&lt;div id&#x3D;&quot;headfakedom&quot;&gt;&lt;&#x2F;div&gt;</code> not to be a child of <code>&lt;head&gt;</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_0').ruleId).toBe('elements-not-allowed-in-head');
    });

    it('should return no reports when there is no invalid elements in head section', () => {
      fakeDom = document.createElement('noscript');
      fakeDom.id = 'headfakedom';
      document.head.appendChild(fakeDom);

      const nodes = DomUtility.querySelectorAllExclude(selector);

      new ElementsNotAllowed().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });

});
