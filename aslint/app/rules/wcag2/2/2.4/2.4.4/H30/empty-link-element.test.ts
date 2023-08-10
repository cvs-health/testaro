import { EmptyLinkElement } from './empty-link-element';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('EmptyLinkElement#', () => {

  let fakeDom;
  const selector = 'a, [role="link"]';

  new EmptyLinkElement().registerValidator();

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

  it('should return 1 report when there is a link with empty content', () => {
    fakeDom.innerHTML = '<a href="test.html"></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link should have a description, but the content is empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });


  it('should return 1 report when there is a link with empty content in child element', () => {
    fakeDom.innerHTML = '<a href="test.html"><span></span></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link should have a description, but the content is empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });

  it('should return 1 report when there is a link with spaces only in description', () => {
    fakeDom.innerHTML = '<a href="test.html">     </a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link content has only whitespaces.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });

  it('should return 1 report when there is a link with spaces only in child element', () => {
    fakeDom.innerHTML = '<a href="test.html"><p>        </p></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link content has only whitespaces.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });

  it('should return 1 report when there is a link with an empty content and aria-label with description', () => {
    fakeDom.innerHTML = '<a href="test.html" aria-label="test"></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link should have a description, but the content is empty. Having only defined an attribute aria-label="test" is not sufficient and it is recommended to have the content instead, e.g. at least visually hidden, but exposed to assisitve technologies. Some users are disabling styles for better readability, and also description from attribute is not available for automatic translators.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });

  it('should return 1 report when there is a link with aria-labelledby that has no associated elements', () => {
    fakeDom.innerHTML = '<p id="m">AriaLabelledBy</p><a href="test.html" aria-labelledby="t"></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link should have a description, but the content is empty. The link has defined <code>aria-labelledby="t"</code>, but the associated elements with following ids <code>t</code> does not exist.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });

  it('should return 1 report when there is a link with aria-labelledby that has no corresponding id and contains spaces', () => {
    fakeDom.innerHTML = '<p id="m">AriaLabelledBy</p><a href="test.html" aria-labelledby="t">     </a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link content has only whitespaces. The link has defined <code>aria-labelledby="t"</code>, but the associated elements with following ids <code>t</code> does not exist.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });

  it('should return 1 report when there is an element with aria-label=""', () => {
    fakeDom.innerHTML = '<a href="test.html" aria-label=""></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link should have a description, but the content is empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });

  it('should return 1 report when there is an element with aria-label="      " and no link description', () => {
    fakeDom.innerHTML = '<a href="test.html" aria-label="      "></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The link should have a description, but the content is empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-link-element');
  });

  it('should return no report when there is an element with aria-hidden="true"', () => {
    fakeDom.innerHTML = '<a href="test.html" aria-hidden="true"></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no report when there is an element with aria-labelledby="m"', () => {
    fakeDom.innerHTML = '<p id="m">AriaLabelledBy</p><a href="test.html" aria-labelledby="m">Test</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyLinkElement().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
