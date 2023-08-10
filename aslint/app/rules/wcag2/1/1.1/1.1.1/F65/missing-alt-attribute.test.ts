import { MissingAltAttribute } from './missing-alt-attribute';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';
import { Config } from '../../../../../../config';
import { $runnerSettings } from '../../../../../../constants/aslint';

const RED_DOT_IMG = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

const config = Config.getInstance();

config.init();

describe('MissingAltAttribute', () => {

  let fakeDom;
  const selector = 'img:not([alt]), area:not([alt]), input[type="image"]:not([alt]), [role="img"]:not([alt])';

  new MissingAltAttribute().registerValidator();

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

  it('should return one report when there is an element with missing alt attribute on img', () => {
    fakeDom.innerHTML = `<img src="${RED_DOT_IMG}" style="width: 10px; height: 10px;">Image1</img>`;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('Missing defined attribute <code>alt</code>.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('img');
    expect(Validator.getReport('report_0').ruleId).toBe('missing-alt-attribute');
  });

  it('should return one report when there is an element with missing alt attribute on area', () => {
    fakeDom.innerHTML = '<area style="display: block; width: 10px;">Area1</area>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('Missing defined attribute <code>alt</code>.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('area');
    expect(Validator.getReport('report_0').ruleId).toBe('missing-alt-attribute');
  });

  it('should return one report when there is an element with missing alt attribute on role="img', () => {
    fakeDom.innerHTML = '<div role="img">RoleImage</div>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('Missing defined attribute <code>alt</code>.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
    expect(Validator.getReport('report_0').ruleId).toBe('missing-alt-attribute');
  });

  it('should return one report when there is an element with missing alt attribute on input type="image"', () => {
    fakeDom.innerHTML = '<input type="image" style="display: block; width: 10px;">InputTypeImage</input>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('Missing defined attribute <code>alt</code>.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('input');
    expect(Validator.getReport('report_0').ruleId).toBe('missing-alt-attribute');
  });

  it('should return no reports when there is alt on img and img has defined aria-hidden="true"', () => {
    fakeDom.innerHTML = `<img aria-hidden="true" src="${RED_DOT_IMG}" style="width: 10px; height: 10px;" alt="Image1"/>`;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is alt on img', () => {
    fakeDom.innerHTML = `<img src="${RED_DOT_IMG}" style="width: 10px; height: 10px;" alt="Image1">Image1</img>`;

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is alt on area', () => {
    fakeDom.innerHTML = '<area alt="Area1">Area1</area>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is alt on role="img', () => {
    fakeDom.innerHTML = '<div role="img" alt="RoleImage">RoleImage</div>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an attribute alt defined on input type="image"', () => {
    fakeDom.innerHTML = '<input type="image" alt="InputTypeImage"/>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new MissingAltAttribute().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  describe('skipping conditions', () => {

    it('should skip when there is a hidden element with missing alt attribute on img', () => {
      fakeDom.innerHTML = `<img src="${RED_DOT_IMG}" style="width: 10px; height: 10px; visibility: hidden;">Image1</img>`;
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      const originalIncludeHidden = config.get($runnerSettings.includeHidden);

      config.set($runnerSettings.includeHidden, false);

      new MissingAltAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);

      config.set($runnerSettings.includeHidden, originalIncludeHidden);
    });

    it('should skip when there is an opaque element with missing alt attribute on img', () => {
      fakeDom.innerHTML = `<img src="${RED_DOT_IMG}" style="width: 10px; height: 10px; opacity: 0;">Image1</img>`;
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

      const originalIncludeHidden = config.get($runnerSettings.includeHidden);

      config.set($runnerSettings.includeHidden, false);

      new MissingAltAttribute().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').skipReason).toBe($auditRuleNodeSkipReason.excludedFromScanning);

      config.set($runnerSettings.includeHidden, originalIncludeHidden);
    });
  });

});
