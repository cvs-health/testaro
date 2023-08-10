import { AppletMissingAlt } from './applet-missing-alt';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('AreaMissingAlt#', () => {

  let fakeDom;
  const selector = 'applet';

  new AppletMissingAlt().registerValidator();

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

  it('should return one report when there is applet with empty alt', () => {

    fakeDom.innerHTML = '<applet alt="" />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAppletElement[];

    new AppletMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined an <code>alt</code> attribute with empty content, but it should describe the <code>applet</code>\'s function.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('applet');
    expect(Validator.getReport('report_0').ruleId).toBe('applet-missing-alt');
  });

  it('should return one report when there is applet with not trimmed alt', () => {

    fakeDom.innerHTML = '<applet alt="       " />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAppletElement[];

    new AppletMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The text within the <code>alt</code> attribute should describe the <code>applet</code>\'s function. It contains only white space and therefore it is ignored by assistive technologies.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('applet');
    expect(Validator.getReport('report_0').ruleId).toBe('applet-missing-alt');
  });

  it('should return one report when there is applet with alt that does not have value', () => {

    fakeDom.innerHTML = '<applet alt />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAppletElement[];

    new AppletMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined an <code>alt</code> attribute with empty content, but it should describe the <code>applet</code>\'s function.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('applet');
    expect(Validator.getReport('report_0').ruleId).toBe('applet-missing-alt');
  });

  it('should return one report when there is applet without alt', () => {

    fakeDom.innerHTML = '<applet/>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAppletElement[];

    new AppletMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have not defined an <code>alt</code> attribute that provides a text alternative to the browsers that supporting the element but are unable to load the <code>applet</code>.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('applet');
    expect(Validator.getReport('report_0').ruleId).toBe('applet-missing-alt');
  });

  it('should return no reports when alt="Test"', () => {

    fakeDom.innerHTML = '<applet alt="Test" />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAppletElement[];

    new AppletMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when alt="      1      "', () => {

    fakeDom.innerHTML = '<applet alt="      1      " />';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAppletElement[];

    new AppletMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
