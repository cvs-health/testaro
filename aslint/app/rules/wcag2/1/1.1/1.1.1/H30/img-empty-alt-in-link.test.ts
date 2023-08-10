import { ImgEmptyAltInLink } from './img-empty-alt-in-link';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('ImgEmptyAltInLink', () => {

  let fakeDom;
  const selector = 'a img';

  new ImgEmptyAltInLink().registerValidator();

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

  it('should return one report when there is an anchor with empty alt', () => {
    fakeDom.innerHTML = '<a href=""><img src="" alt="" /></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLImageElement[];

    new ImgEmptyAltInLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined empty content for <code>alt</code> attribute in <code>&lt;img/&gt;</code>.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-empty-alt-in-link');
  });

  it('should return one report when there is an anchor with not trimmed alt', () => {

    fakeDom.innerHTML = '<a href=""><img src="" alt="   " /></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLImageElement[];

    new ImgEmptyAltInLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined <code>alt</code> attribute in <code>&lt;img/&gt;</code>, but it contains only whitespace.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-empty-alt-in-link');
  });

  it('should return one report when there is an anchor with alt does not have value', () => {

    fakeDom.innerHTML = '<a href=""><img src="" alt /></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLImageElement[];

    new ImgEmptyAltInLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined empty content for <code>alt</code> attribute in <code>&lt;img/&gt;</code>.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-empty-alt-in-link');
  });

  it('should return one report when parent has not trimmed text content', () => {

    fakeDom.innerHTML = '<a href="">     <img src="" alt="" /></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLImageElement[];

    new ImgEmptyAltInLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('You have defined empty content for <code>alt</code> attribute in <code>&lt;img/&gt;</code>.');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-empty-alt-in-link');
  });

  it('should return no reports when alt="Test"', () => {

    fakeDom.innerHTML = '<a href=""><img src="" alt="Test" /></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLImageElement[];

    new ImgEmptyAltInLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when alt does not exists', () => {

    fakeDom.innerHTML = '<a href=""><img src="" /></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLImageElement[];

    new ImgEmptyAltInLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when parent has text content', () => {

    fakeDom.innerHTML = '<a href="">DivTextContent<img src="" alt="" /></a>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLImageElement[];

    new ImgEmptyAltInLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
