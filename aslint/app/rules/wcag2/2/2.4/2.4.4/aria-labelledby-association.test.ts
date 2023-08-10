import { AriaLabelledbyAssociation } from './aria-labelledby-association';
import { Validator } from '../../../../../validator';
import { DomUtility } from '../../../../../utils/dom';

describe('AriaLabelledbyAssociation', () => {

  let fakeDom;
  const selector = '[aria-labelledby]';

  new AriaLabelledbyAssociation().registerValidator();

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

  it('should return no reports when there is a non-empty element associated through aria-labelledby', () => {
    fakeDom.innerHTML = '<a href="test.html" aria-labelledby="someReference"></a><p id="someReference">Hello</p>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new AriaLabelledbyAssociation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return 1 report when one element exists, and the other one does not exists', () => {
    fakeDom.innerHTML = '<a href="test.html" aria-labelledby="nonExistsingReference existingReference"></a><p id="existingReference">Hello</p>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new AriaLabelledbyAssociation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('Elements with an attribute <code>id</code>s: <code>nonExistsingReference/code> defined in <code>aria-labelledby="nonExistsingReference existingReference"</code> does not exists.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('aria-labelledby-association');
  });

  it('should return 1 report when one element does not exists', () => {
    fakeDom.innerHTML = '<a href="test.html" aria-labelledby="nonExistsingReference"></a><p id="existingReference">Hello</p>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new AriaLabelledbyAssociation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('Elements with an attribute <code>id</code>s: <code>nonExistsingReference/code> defined in <code>aria-labelledby="nonExistsingReference"</code> does not exists.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('aria-labelledby-association');
  });

});
