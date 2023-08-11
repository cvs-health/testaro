import { Time } from './time';

describe('Utils', () => {

  describe('Time', () => {

    describe('#format', () => {

      it('should return "< 1 ms" when value is 0.1 ms', () => {
        expect(Time.format(0.1)).toBe('< 1 ms');
      });

      it('should return seconds and miliseconds formatted when value is 1.0499999999992724 ms', () => {
        expect(Time.format(1.0499999999992724)).toBe('1ms');
      });

      it('should return seconds and miliseconds formatted when value is 1300 ms', () => {
        expect(Time.format(1300)).toBe('1s 300ms');
      });

      it('should return minutes, seconds and miliseconds formatted when value is 61003 ms', () => {
        expect(Time.format(61003)).toBe('1m 1s 3ms');
      });

      it('should return minutes and miliseconds formatted when value is 60300 ms', () => {
        expect(Time.format(60300)).toBe('1m 300ms');
      });

      it('should return minutes, seconds and miliseconds formatted when value is 62300 ms', () => {
        expect(Time.format(62300)).toBe('1m 2s 300ms');
      });

      it('should return miliseconds formatted when value is 50 ms', () => {
        expect(Time.format(50)).toBe('50ms');
      });

      it('should return formatted and rounded milliseconds long number', () => {
        expect(Time.format(21.1234500000013)).toBe('21ms');
      });
    });

  });
});
