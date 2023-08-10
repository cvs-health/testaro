import { H1MustBe } from './h1-must-be';
import { Validator } from '../../../validator';
import { DomUtility } from '../../../utils/dom';

describe('Rules', () => {

  describe('H1MustBe', () => {

    let fakeDom;

    new H1MustBe().registerValidator();

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

    it('should return one report when there is no elements with h1', () => {
      fakeDom.innerHTML = '<div><h2>h1</h2></div>';

      new H1MustBe().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected at least one heading <code>h1</code> element, but found none.');
      expect(Validator.getReport('report_0').node).toBe(null);
      expect(Validator.getReport('report_0').ruleId).toBe('h1-must-be');
    });

    it('should return no reports when there is element with h1', () => {
      fakeDom.innerHTML = '<div><h1>h1</h1></div>';

      new H1MustBe().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
