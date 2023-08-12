import { FlashContent } from './flash-content';
import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';

describe('Rules', () => {

  describe('#flash-content', () => {

    let fakeDom;

    new FlashContent().registerValidator();

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

    it('should return one report for one flash object', () => {
      const objectEl = document.createElement('object');

      objectEl.setAttribute('classid', 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000');
      objectEl.setAttribute('codebase', 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0');
      fakeDom.appendChild(objectEl);

      const nodes = DomUtility.querySelectorAllExclude('[classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"]', fakeDom);

      new FlashContent().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
    });

    it('should return no reports where there are no flash objects', () => {
      fakeDom.innerHTML = '<a href="#">test</a>';

      const nodes = DomUtility.querySelectorAllExclude('[classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"]', fakeDom);

      new FlashContent().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });

});
