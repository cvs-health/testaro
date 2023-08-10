import { App } from './app';
import { busEvent } from './constants/events';
import { Bus } from './services/bus';
import { Console } from './utils/console';
import { Validator } from './validator';

describe('App', () => {

  let app: App;

  beforeEach(() => {
    Validator.reset();
    Bus.publish(busEvent.onApplicationDispose);
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  describe('#init', () => {

    it('should initalize an application', () => {
      jest.spyOn(Console, 'init');

      app = new App();

      expect(Console.init).toHaveBeenCalled();
    });

  });

  describe('#run', () => {

    it('should run tests with invalid typeof of callback', () => {
      app = new App();

      expect(() => {
        app.run({} as any);
      }).toThrowError('[App.run] passed callback must be type of function, but got object');
    });

  });

});
