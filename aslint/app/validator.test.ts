import { Validator } from './validator';
import { Config } from './config';
import { Bus } from './services/bus';
import { Async } from './utils/async';
import { DomUtility } from './utils/dom';
import { busEvent } from './constants/events';

const config = Config.getInstance();

config.init();

describe('Validator', () => {

  describe('#runTests', () => {

    let fakeDom;

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

    it('should run asynchronously tests', () => {

      const validatorStarted = jest.fn();
      const busyIndicatorOn = jest.fn();

      fakeDom.innerHTML = '<p>test <span>example</span></p>';

      const asyncRunner = config.get('asyncRunner');

      config.set('asyncRunner', true);

      Bus.subscribe(busEvent.onValidatorStarted, validatorStarted);
      Bus.subscribe(busEvent.onBusyIndicatorOn, busyIndicatorOn);

      Validator.runTests(fakeDom);

      expect(validatorStarted).toHaveBeenCalled();
      expect(busyIndicatorOn).toHaveBeenCalledWith('Validating HTML 2 elements.', true);

      Bus.unsubscribe(busEvent.onValidatorStarted, validatorStarted);
      Bus.unsubscribe(busEvent.onBusyIndicatorOn, busyIndicatorOn);

      config.set('asyncRunner', asyncRunner);
    });

    it('should run synchronously tests', () => {

      const validatorStarted = jest.fn();
      const busyIndicatorOn = jest.fn();
      const asyncRun = jest.spyOn(Async, 'run');

      fakeDom.innerHTML = '<p>test <span>example</span></p>';

      asyncRun.mockReset();

      const asyncRunner = config.get('asyncRunner');

      config.set('asyncRunner', false);

      Bus.subscribe(busEvent.onValidatorStarted, validatorStarted);
      Bus.subscribe(busEvent.onBusyIndicatorOn, busyIndicatorOn);

      Validator.runTests(fakeDom);

      expect(validatorStarted).toHaveBeenCalled();
      expect(busyIndicatorOn).toHaveBeenCalledWith('Validating HTML 2 elements.', true);
      expect(asyncRun.mock.calls.length).toBe(0);

      Bus.unsubscribe(busEvent.onValidatorStarted, validatorStarted);
      Bus.unsubscribe(busEvent.onBusyIndicatorOn, busyIndicatorOn);

      config.set('asyncRunner', asyncRunner);
    });

  });

});
