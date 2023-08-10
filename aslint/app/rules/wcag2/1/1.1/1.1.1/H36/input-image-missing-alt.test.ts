import { InputImageMissingAlt } from './input-image-missing-alt';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('InputImageMissingAlt#', () => {

  let fakeDom;
  const selector = 'input[type="image"]';

  new InputImageMissingAlt().registerValidator();

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

  it('should return one report when there is type="image" alt=""', () => {

    fakeDom.innerHTML = '<input type="image" alt="">Input</input>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

    new InputImageMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined an <code>alt</code> attribute with empty content, but it should describe the button\'s function.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
    expect(Validator.getReport('report_0').ruleId).toBe('input-image-missing-alt');
  });

  it('should return one report when there is type="image" alt="   "', () => {

    fakeDom.innerHTML = '<input type="image" alt="   ">Input</input>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

    new InputImageMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The text in the <code>alt</code> attribute should describe the button\'s function. It contains only white space and therefore it is ignored by assistive technologies.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
    expect(Validator.getReport('report_0').ruleId).toBe('input-image-missing-alt');
  });

  it('should return one report when there is type="image" alt', () => {

    fakeDom.innerHTML = '<input type="image" alt>Input</input>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

    new InputImageMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined an <code>alt</code> attribute with empty content, but it should describe the button\'s function.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
    expect(Validator.getReport('report_0').ruleId).toBe('input-image-missing-alt');
  });

  it('should return one report when there is type="image"', () => {

    fakeDom.innerHTML = '<input type="image">Input</input>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

    new InputImageMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have not defined an <code>alt</code> attribute that describes the button\'s function.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
    expect(Validator.getReport('report_0').ruleId).toBe('input-image-missing-alt');
  });

  it('should return no reports when alt="Test"', () => {

    fakeDom.innerHTML = '<input type="image" alt="Test">Input</input>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

    new InputImageMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when alt="     Test   "', () => {

    fakeDom.innerHTML = '<input type="image" alt="     Test   ">Input</input>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLInputElement[];

    new InputImageMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
