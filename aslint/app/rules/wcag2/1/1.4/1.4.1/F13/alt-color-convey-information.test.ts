import { AltColorConveyInformation } from './alt-color-convey-information';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('AltColorConveyInformation#', () => {

    let fakeDom;
    const selector = 'img[alt], area[alt], [role="img"][alt], input[type="image"][alt]';

    new AltColorConveyInformation().registerValidator();

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

    it('should return 2 reports when there is img with alt="blue" and area alt="aero blue"</area>', () => {
      fakeDom.innerHTML = '<img src="test.html" alt="blue">Blue</img><area alt="aero blue">chelsea cucumber</area>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('Check that the information in the <code>alt</code> attribute conveyed by colors <code>blue</code> are included in the text alternative for the image.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('img');
      expect(Validator.getReport('report_0').ruleId).toBe('alt-color-convey-information');
      expect(Validator.getReport('report_1').message).toBe('Check that the information in the <code>alt</code> attribute conveyed by colors <code>aero blue</code> are included in the text alternative for the image.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('area');
      expect(Validator.getReport('report_1').ruleId).toBe('alt-color-convey-information');
    });

    it('should return 1 report when there is img with alt="blue"', () => {
      fakeDom.innerHTML = '<img src="test.html" alt="blue">Blue</img>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Check that the information in the <code>alt</code> attribute conveyed by colors <code>blue</code> are included in the text alternative for the image.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('img');
      expect(Validator.getReport('report_0').ruleId).toBe('alt-color-convey-information');
    });

    it('should return 1 report when there is area with alt="chelsea cucumber"', () => {
      fakeDom.innerHTML = '<area alt="chelsea cucumber">chelsea cucumber</area>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Check that the information in the <code>alt</code> attribute conveyed by colors <code>chelsea cucumber</code> are included in the text alternative for the image.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('area');
      expect(Validator.getReport('report_0').ruleId).toBe('alt-color-convey-information');
    });

    it('should return 1 report when there is role img with alt="cyan / aqua"', () => {
      fakeDom.innerHTML = '<div role="img" alt="cyan / aqua">cyan / aqua</div>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Check that the information in the <code>alt</code> attribute conveyed by colors <code>cyan / aqua</code> are included in the text alternative for the image.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
      expect(Validator.getReport('report_0').ruleId).toBe('alt-color-convey-information');
    });

    it('should return 1 report when there is input with alt="abbey mountain meadow"', () => {
      fakeDom.innerHTML = '<input type="image" alt="abbey mountain meadow">abbey mountain meadow</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Check that the information in the <code>alt</code> attribute conveyed by colors <code>abbey, mountain meadow</code> are included in the text alternative for the image.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
      expect(Validator.getReport('report_0').ruleId).toBe('alt-color-convey-information');
    });

    it('should return no report when there is alt with non existed color', () => {
      fakeDom.innerHTML = '<input type="image" alt="nosuchcolor">nosuchcolor</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is alt with spaces', () => {
      fakeDom.innerHTML = '<input type="image" alt="   ">   R</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is empty alt', () => {
      fakeDom.innerHTML = '<input type="image" alt="">Empty</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is alt with no value', () => {
      fakeDom.innerHTML = '<input type="image" alt>No value</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is no alt', () => {
      fakeDom.innerHTML = '<input type="image">No alt</input>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new AltColorConveyInformation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
