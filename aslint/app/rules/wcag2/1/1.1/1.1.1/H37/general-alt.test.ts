import { GeneralAlt } from './general-alt';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('GeneralAlt#', () => {

  let fakeDom;
  const selector = '[role="img"][alt], input[type="image"][alt]';

  new GeneralAlt().registerValidator();

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

  it('should return one report when there is role="img" with filled alt', () => {

    fakeDom.innerHTML = '<div role="img" alt=" Text  " />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The text within the <code>alt</code> attribute should let the user know what an image\'s content and purpose are. When an image contains words that are important to understanding the content, the alt text should include those words. Likewise, adding the attribute <code>aria-label="Image description here"</code> to the <code>%0</code> element that uses <code>role="img"</code> is recommended to further help assistive technologies convey the meaning of your content.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
    expect(Validator.getReport('report_0').ruleId).toBe('general-alt');
  });

  it('should return one report when there is role="img" with filled alt no trims', () => {

    fakeDom.innerHTML = '<div role="img" alt="Text" />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The text within the <code>alt</code> attribute should let the user know what an image\'s content and purpose are. When an image contains words that are important to understanding the content, the alt text should include those words. Likewise, adding the attribute <code>aria-label="Image description here"</code> to the <code>%0</code> element that uses <code>role="img"</code> is recommended to further help assistive technologies convey the meaning of your content.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
    expect(Validator.getReport('report_0').ruleId).toBe('general-alt');
  });

  it('should return one report when there is role="img" with filled alt', () => {

    fakeDom.innerHTML = '<input type="image" alt=" Text  " />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The text within the <code>alt</code> attribute should let the user know what an image\'s content and purpose are. When an image contains words that are important to understanding the content, the alt text should include those words. Likewise, adding the attribute <code>aria-label="Image description here"</code> to the <code>%0</code> element that uses <code>role="img"</code> is recommended to further help assistive technologies convey the meaning of your content.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
    expect(Validator.getReport('report_0').ruleId).toBe('general-alt');
  });

  it('should return one report when there is role="img" with filled alt no trims', () => {

    fakeDom.innerHTML = '<input type="image" alt="Text" />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The text within the <code>alt</code> attribute should let the user know what an image\'s content and purpose are. When an image contains words that are important to understanding the content, the alt text should include those words. Likewise, adding the attribute <code>aria-label="Image description here"</code> to the <code>%0</code> element that uses <code>role="img"</code> is recommended to further help assistive technologies convey the meaning of your content.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
    expect(Validator.getReport('report_0').ruleId).toBe('general-alt');
  });

  it('should return no reports when role="img" alt=""', () => {

    fakeDom.innerHTML = '<div role="img" alt="" />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when role="img" alt="            "', () => {

    fakeDom.innerHTML = '<div role="img" alt="            " />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when role="img" alt is empty', () => {

    fakeDom.innerHTML = '<div role="img" alt/>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when role="img" alt does not exist', () => {

    fakeDom.innerHTML = '<div role="img"/>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when type="image" alt=""', () => {

    fakeDom.innerHTML = '<input type="image" alt="" />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when type="image" alt="            "', () => {

    fakeDom.innerHTML = '<input type="image" alt="            " />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when type="image" alt is empty', () => {

    fakeDom.innerHTML = '<input type="image" alt/>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when type="image" alt does not exist', () => {

    fakeDom.innerHTML = '<input type="image"/>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new GeneralAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
