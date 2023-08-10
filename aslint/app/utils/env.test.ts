import { Env } from './env';

describe('Utils', () => {

  describe('Env', () => {

    describe('#isTest', () => {
      it('should identify Jest runtime environment properly', () => {
        expect(Env.isTest).toBe(true);
      });
    });

  });
});
