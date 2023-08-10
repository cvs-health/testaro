import { ClickVerb } from './click-verb';
import { Validator } from '../../../../../validator';
import { DomUtility } from '../../../../../utils/dom';

describe('ClickVerb', () => {

  let fakeDom;
  const selector = 'a';

  new ClickVerb().registerValidator();

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

  it('should return 2 reports when there are 2 elements with "Click here" and "Click me" text', () => {
    fakeDom.innerHTML = '<a href="test.html">Click here</a><div>Test</div><a href="test1.html">Click me</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ClickVerb().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(2);
    expect(Validator.getReport('report_0').message).toBe('The verb <q>click</q> must not be used in a link. <q>Click</q> presupposes the use of a mouse, but some users will activate links via keyboard commands (i.e. <kbd>Enter</kbd>) and/or other assistive technologies.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('click-verb');
    expect(Validator.getReport('report_1').message).toBe('The verb <q>click</q> must not be used in a link. <q>Click</q> presupposes the use of a mouse, but some users will activate links via keyboard commands (i.e. <kbd>Enter</kbd>) and/or other assistive technologies.');
    expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_1').ruleId).toBe('click-verb');
  });

  it('should return one report when there is an element with "Click here" text', () => {
    fakeDom.innerHTML = '<a href="test.html">Click here</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ClickVerb().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The verb <q>click</q> must not be used in a link. <q>Click</q> presupposes the use of a mouse, but some users will activate links via keyboard commands (i.e. <kbd>Enter</kbd>) and/or other assistive technologies.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('click-verb');
  });

  it('should return one report when there is an element with "   Click   " text', () => {
    fakeDom.innerHTML = '<a href="test.html">   Click   </a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ClickVerb().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The verb <q>click</q> must not be used in a link. <q>Click</q> presupposes the use of a mouse, but some users will activate links via keyboard commands (i.e. <kbd>Enter</kbd>) and/or other assistive technologies.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('click-verb');
  });

  it('should return one report when there is an element with "Click me" text', () => {
    fakeDom.innerHTML = '<a href="test.html">Click me</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ClickVerb().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The verb <q>click</q> must not be used in a link. <q>Click</q> presupposes the use of a mouse, but some users will activate links via keyboard commands (i.e. <kbd>Enter</kbd>) and/or other assistive technologies.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('click-verb');
  });

  it('should return no report when there is an element with "doubleclick" text', () => {
    fakeDom.innerHTML = '<a href="test.html">doubleclick</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ClickVerb().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no report when there is an element with "clickdouble" text', () => {
    fakeDom.innerHTML = '<a href="test.html">clickdouble</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ClickVerb().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no report when there is alt on input type="image"', () => {
    fakeDom.innerHTML = '<a href="test.html"></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ClickVerb().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });
});
