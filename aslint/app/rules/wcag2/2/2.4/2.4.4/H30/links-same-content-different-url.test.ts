import { LinksSameContentDifferenceUrl } from './links-same-content-different-url';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('LinksSameContentDifferenceUrl#', () => {

  let fakeDom;
  const selector = 'body a';

  new LinksSameContentDifferenceUrl().registerValidator();

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

  it('should return 2 reports when there are 3 anchors with the same content, but there are only 2 anchors with the same content and url', () => {
    fakeDom.innerHTML = '<a href="test1.html">Test</a><br/><a href="test.html">Test</a><br/><a href="test1.html">Test</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(2);
    expect(Validator.getReport('report_0').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('links-same-content-different-url');
    expect(Validator.getReport('report_1').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_1').ruleId).toBe('links-same-content-different-url');
  });

  it('should return one report when there are 2 different links with same content', () => {
    fakeDom.innerHTML = '<a href="test.html">Test</a><a href="test1.html">Test</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(2);
    expect(Validator.getReport('report_0').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('links-same-content-different-url');
    expect(Validator.getReport('report_1').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_1').ruleId).toBe('links-same-content-different-url');
  });

  it('should return one report when there are 2 different links with same content with spaces', () => {
    fakeDom.innerHTML = '<a href="test.html">     </a><a href="test1.html">    </a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(2);
    expect(Validator.getReport('report_0').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('links-same-content-different-url');
    expect(Validator.getReport('report_1').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_1').ruleId).toBe('links-same-content-different-url');
  });

  it('should return 2 reports when there are 2 different links with content that is empty', () => {
    fakeDom.innerHTML = '<a href="test.html"></a><a href="test1.html"></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(2);
    expect(Validator.getReport('report_0').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('links-same-content-different-url');
    expect(Validator.getReport('report_1').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_1').ruleId).toBe('links-same-content-different-url');
  });

  it('should return 1 report when there are 2 different links with same content in different child elements', () => {
    fakeDom.innerHTML = '<a href="test.html"><p>Text</p></a><a href="test1.html"><div>Text</div></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(2);
    expect(Validator.getReport('report_0').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('links-same-content-different-url');
    expect(Validator.getReport('report_1').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_1').ruleId).toBe('links-same-content-different-url');
  });

  it('should return 1 report when there are 2 different links with same content in same child elements', () => {
    fakeDom.innerHTML = '<a href="test.html"><p>Text</p></a><a href="test1.html"><p>Text</p></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(2);
    expect(Validator.getReport('report_0').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('links-same-content-different-url');
    expect(Validator.getReport('report_1').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_1').ruleId).toBe('links-same-content-different-url');
  });

  it('should return one report when there are 2 different links with same content in same child elements', () => {
    fakeDom.innerHTML = '<a href="test.html">Text<p>text</p></a><a href="test1.html">Text<p>text</p></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(2);
    expect(Validator.getReport('report_0').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('links-same-content-different-url');
    expect(Validator.getReport('report_1').message).toBe('There are anchor elements that have the same content, but different destination URLs.');
    expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_1').ruleId).toBe('links-same-content-different-url');
  });

  it('should return no report when there are 2 same links with same content', () => {
    fakeDom.innerHTML = '<a href="test.html">Test</a><a href="test.html">Test</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no report when there is 1 link', () => {
    fakeDom.innerHTML = '<a href="test.html">Test</a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no report when there is no link', () => {
    fakeDom.innerHTML = '<div>Test</div>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new LinksSameContentDifferenceUrl().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
