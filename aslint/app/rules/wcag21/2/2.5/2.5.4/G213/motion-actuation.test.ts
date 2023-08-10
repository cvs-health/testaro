import { DomUtility } from '../../../../../../utils/dom';
import { Validator } from '../../../../../../validator';
import { MotionActuation } from './motion-actuation';

describe('Rules', () => {

  describe('MotionActuation', () => {

    let fakeDom;
    const selector = '[autocomplete]';

    new MotionActuation().registerValidator();

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

    it('should return 1 report when DeviceMotionEvent and DeviceOrientationEvent is supported', () => {
      Object.defineProperty(window, 'DeviceMotionEvent', {
        value: () => {},
        writable: true
      });

      Object.defineProperty(window, 'DeviceOrientationEvent', {
        value: () => {},
        writable: true
      });

      const nodes: Element[] = [DomUtility.getRootElement()];

      new MotionActuation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Is API DeviceMotionEvent and DeviceOrientationEvent supported on the current environment? true. However, unless it is an essential part of the application purpose, don\'t rely on device motion for functionality and use an alternative and traditional controls that do the same function.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('html');
      expect(Validator.getReport('report_0').ruleId).toBe('motion-actuation');
    });

    it('should return 1 report when DeviceMotionEvent and DeviceOrientationEvent is not supported', () => {
      Object.defineProperty(window, 'DeviceMotionEvent', {
        value: undefined,
        writable: true
      });

      Object.defineProperty(window, 'DeviceOrientationEvent', {
        value: undefined,
        writable: true
      });

      const nodes: Element[] = [DomUtility.getRootElement()];

      new MotionActuation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Is API DeviceMotionEvent and DeviceOrientationEvent supported on the current environment? false. However, unless it is an essential part of the application purpose, don\'t rely on device motion for functionality and use an alternative and traditional controls that do the same function.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('html');
      expect(Validator.getReport('report_0').ruleId).toBe('motion-actuation');
    });

  });

});
