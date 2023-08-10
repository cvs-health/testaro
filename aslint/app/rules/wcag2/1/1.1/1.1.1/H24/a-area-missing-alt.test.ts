import { AreaMissingAlt } from './a-area-missing-alt';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('AreaMissingAlt', () => {

  let fakeDom;
  const selector = 'area';

  new AreaMissingAlt().registerValidator();

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

  it('should return one report when there is an area with missing alt', () => {

    fakeDom.innerHTML = '<area>AreaMissingAlt</area>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAreaElement[];

    new AreaMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have not defined an <code>alt</code> attribute that describes the function of the image map area.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('area');
    expect(Validator.getReport('report_0').ruleId).toBe('area-missing-alt');
  });

  it('should return one report when there is an area with alt', () => {
    fakeDom.innerHTML = '<area alt>AreaMissingAlt</area>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAreaElement[];

    new AreaMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined an <code>alt</code> attribute with an empty content, but it should describe the function of the image map area.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('area');
    expect(Validator.getReport('report_0').ruleId).toBe('area-missing-alt');
  });

  it('should return one report when there is an area with alt=""', () => {

    fakeDom.innerHTML = '<area alt="">AreaMissingAlt</area>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAreaElement[];

    new AreaMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined an <code>alt</code> attribute with an empty content, but it should describe the function of the image map area.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('area');
    expect(Validator.getReport('report_0').ruleId).toBe('area-missing-alt');
  });

  it('should return one report when there is an area with alt="  "', () => {

    fakeDom.innerHTML = '<area alt="  ">AreaMissingAlt</area>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAreaElement[];

    new AreaMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The text within the <code>alt</code> attribute should describe the function of the image map area. It contains only white space and therefore it is ignored by assistive technologies.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('area');
    expect(Validator.getReport('report_0').ruleId).toBe('area-missing-alt');
  });

  it('should return no reports when there is alt on img', () => {

    fakeDom.innerHTML = '<area alt="AreaMissingAlt">AreaMissingAlt</area>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAreaElement[];

    new AreaMissingAlt().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
