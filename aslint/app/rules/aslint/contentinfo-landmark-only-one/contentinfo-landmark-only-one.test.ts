import { ContentinfoLandmarkOnlyOne } from './contentinfo-landmark-only-one';
import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';

describe('Rules', () => {

  describe('ContentinfoLandmarkOnlyOne', () => {

    let fakeDom;

    new ContentinfoLandmarkOnlyOne().registerValidator();

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

    it('should return one report when there is an element with more than one attribute role="contentinfo"', () => {
      fakeDom.innerHTML = '<div role="contentinfo"></div><div role="contentinfo"></div>';

      const nodes = DomUtility.querySelectorAllExclude('[role=contentinfo]', fakeDom);

      new ContentinfoLandmarkOnlyOne().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>role&#x3D;&quot;contentinfo&quot;</code> to be defined only once. You have 2 .');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_0').ruleId).toBe('contentinfo-landmark-only-one');
      expect(Validator.getReport('report_1').message).toBe('Expected attribute <code>role&#x3D;&quot;contentinfo&quot;</code> to be defined only once. You have 2 .');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_1').ruleId).toBe('contentinfo-landmark-only-one');
    });

    it('should return no reports when there is 1 element with attribute role="contentinfo"', () => {
      fakeDom.innerHTML = '<div role="contentinfo">';

      const nodes = DomUtility.querySelectorAllExclude('[role=contentinfo]', fakeDom);

      new ContentinfoLandmarkOnlyOne().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no reports when there is no elements with attribute role="contentinfo"', () => {
      fakeDom.innerHTML = '<div>contentinfo</div>';
      const nodes = DomUtility.querySelectorAllExclude('[role=contentinfo]', fakeDom);

      new ContentinfoLandmarkOnlyOne().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });

});
