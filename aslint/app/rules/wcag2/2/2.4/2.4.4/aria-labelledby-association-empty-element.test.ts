import { AriaLabelledbyAssociationEmptyElement } from './aria-labelledby-association-empty-element';
import { Validator } from '../../../../../validator';
import { DomUtility } from '../../../../../utils/dom';

describe('AriaLabelledbyAssociationEmptyElement', () => {

  let fakeDom;
  const selector = '[aria-labelledby]';

  new AriaLabelledbyAssociationEmptyElement().registerValidator();

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

    new AriaLabelledbyAssociationEmptyElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return 1 report when there is an empty element associated through aria-labelledby', () => {
    fakeDom.innerHTML = '<a href="test.html" aria-labelledby="someReference anotherReference"></a><p id="someReference"></p><div id="anotherReference">Example</div>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new AriaLabelledbyAssociationEmptyElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('Elements with an attribute <code>id</code>s: <code>someReference/code> defined in <code>aria-labelledby="someReference anotherReference"</code> exists, but they are empty. They should not be an empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('aria-labelledby-association-empty-element');

  });

});
