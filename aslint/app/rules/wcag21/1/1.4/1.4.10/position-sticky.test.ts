import { PositionSticky } from './position-sticky';
import { DomUtility } from '../../../../../utils/dom';
import { Validator } from '../../../../../validator';

describe('Rules', () => {

  describe('PositionSticky', () => {

    let fakeDom: HTMLDivElement;

    new PositionSticky().registerValidator();

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

    it('should return 1 report when there is one element with set style to position: sticky;', () => {
      fakeDom.innerHTML = '<p style="position: sticky;">Example</p><span>Without position sticky</span>';

      new PositionSticky().run(fakeDom);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

  });

});
