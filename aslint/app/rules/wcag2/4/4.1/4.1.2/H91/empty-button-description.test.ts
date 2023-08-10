import { EmptyButtonDescription } from './empty-button-description';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('EmptyButtonDescription#', () => {

  let fakeDom;
  const selector = 'button, [role="button"]';

  new EmptyButtonDescription().registerValidator();

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

  it('should return 1 report when there is a button with empty content', () => {
    fakeDom.innerHTML = '<button></button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button should have a description, but the content is empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });


  it('should return 1 report when there is a button with empty content in child element', () => {
    fakeDom.innerHTML = '<button><span></span></button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button should have a description, but the content is empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });

  it('should return 1 report when there is a button with spaces only in description', () => {
    fakeDom.innerHTML = '<button>     </button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button content has only whitespaces.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });

  it('should return 1 report when there is a button with spaces only in child element', () => {
    fakeDom.innerHTML = '<button><p>        </p></button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button content has only whitespaces.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });

  it('should return 1 report when there is a button with an empty content and aria-label with description', () => {
    fakeDom.innerHTML = '<button aria-label="test"></button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button should have a description, but the content is empty. Having only defined an attribute aria-label="test" is not sufficient and it is recommended to have the content instead, e.g. at least visually hidden, but exposed to assisitve technologies. Some users are disabling styles for better readability, and also description from attribute is not available for automatic translators.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });

  it('should return 1 report when there is a button with aria-labelledby that has no associated elements', () => {
    fakeDom.innerHTML = '<p id="m">AriaLabelledBy</p><button aria-labelledby="t"></button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button should have a description, but the content is empty. The button has defined <code>aria-labelledby="t"</code>, but the associated elements with following ids <code>t</code> does not exist.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });

  it('should return 1 report when there is a button with aria-labelledby that has no corresponding id and contains spaces', () => {
    fakeDom.innerHTML = '<p id="m">AriaLabelledBy</p><button aria-labelledby="t">     </button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button content has only whitespaces. The button has defined <code>aria-labelledby="t"</code>, but the associated elements with following ids <code>t</code> does not exist.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });

  it('should return 1 report when there is an element with aria-label=""', () => {
    fakeDom.innerHTML = '<button aria-label=""></button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button should have a description, but the content is empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });

  it('should return 1 report when there is an element with aria-label="      " and no button description', () => {
    fakeDom.innerHTML = '<button aria-label="      "></button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The button should have a description, but the content is empty.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('button');
    expect(Validator.getReport('report_0').ruleId).toBe('empty-button-description');
  });

  it('should return no report when there is an element with aria-hidden="true"', () => {
    fakeDom.innerHTML = '<button aria-hidden="true"></button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no report when there is an element with aria-labelledby="m"', () => {
    fakeDom.innerHTML = '<p id="m">AriaLabelledBy</p><button aria-labelledby="m">Test</button>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new EmptyButtonDescription().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
