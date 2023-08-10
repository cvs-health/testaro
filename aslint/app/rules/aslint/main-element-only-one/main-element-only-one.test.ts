import { MainElementOnlyOne } from './main-element-only-one';
import { Validator } from '../../../validator';
import { DomUtility } from '../../../utils/dom';

describe('Rules', () => {

  describe('MainElementOnlyOne', () => {

    it('should indicate that class exists', () => {
      expect(MainElementOnlyOne).toBeDefined();
    });

    let fakeDom;

    new MainElementOnlyOne().registerValidator();

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

    it('should return one report when there is more than 1 main element', () => {
      fakeDom.innerHTML = '<main>Text1</main><main>Text2</main>';
      const nodes = DomUtility.querySelectorAllExclude('main', fakeDom) as HTMLElement[];

      new MainElementOnlyOne().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('You have defined multiple (2) <code>&lt;main&gt;</code> elements. Assistive technology users expect one main content block and may miss subsequent <code>&lt;main&gt;</code> blocks.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('main');
      expect(Validator.getReport('report_0').ruleId).toBe('main-element-only-one');
      expect(Validator.getReport('report_1').message).toBe('You have defined multiple (2) <code>&lt;main&gt;</code> elements. Assistive technology users expect one main content block and may miss subsequent <code>&lt;main&gt;</code> blocks.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('main');
      expect(Validator.getReport('report_1').ruleId).toBe('main-element-only-one');
    });

    it('should return no reports when there is 1 main element', () => {
      fakeDom.innerHTML = '<main>Text1</main>';
      const nodes = DomUtility.querySelectorAllExclude('main', fakeDom) as HTMLElement[];

      new MainElementOnlyOne().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
