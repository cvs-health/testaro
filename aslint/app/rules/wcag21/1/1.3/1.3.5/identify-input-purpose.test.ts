import { DomUtility } from '../../../../../utils/dom';
import { Validator } from '../../../../../validator';
import { IdentifyInputPurpose } from './identify-input-purpose';

describe('Rules', () => {

  describe('IdentifyInputPurpose', () => {

    let fakeDom;
    const selector = '[autocomplete]';

    new IdentifyInputPurpose().registerValidator();

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

    it('should return no report when provided input form elements contains all valid autocomplete tokens', () => {
      fakeDom.innerHTML = `
      <form>
        <fieldset>
          <legend>Ship the blue gift to...</legend>
          <div><label>Address: <textarea name=ba autocomplete="section-blue shipping street-address"></textarea></label></div>
          <div><label>City: <input name=bc autocomplete="section-blue shipping address-level2"></label></div>
          <div><label>Postal Code: <input name=bp autocomplete="section-blue shipping postal-code"></label></div>
        </fieldset>
       </form>`;

      const nodes: Element[] = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new IdentifyInputPurpose().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when unknown autocomplete token is being used', () => {
      fakeDom.innerHTML = `
      <form>
        <fieldset>
          <legend>Ship the blue gift to...</legend>
          <div><label>Address: <textarea name=ba autocomplete="unknown-token"></textarea></label></div>
        </fieldset>
       </form>`;

      const nodes: Element[] = DomUtility.querySelectorAllExclude(selector, fakeDom);

      new IdentifyInputPurpose().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined an invalid tokens <code>unknown-token</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('textarea');
      expect(Validator.getReport('report_0').ruleId).toBe('identify-input-purpose');
    });

  });

});
