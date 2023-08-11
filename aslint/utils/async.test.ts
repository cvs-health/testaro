import { Async } from './async';

describe('Utils', () => {

  describe('Async', () => {

    describe('#run', () => {
      jest.useFakeTimers();

      it('should call function after specified time', () => {
        const timerCallback = jest.fn();

        Async.run(timerCallback, 500);

        expect(timerCallback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(501);

        expect(timerCallback).toHaveBeenCalled();
      });

    });

  });
});
