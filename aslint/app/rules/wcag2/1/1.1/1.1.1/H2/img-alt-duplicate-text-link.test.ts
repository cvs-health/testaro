import { ImgAltDuplicateTextLink } from './img-alt-duplicate-text-link';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { TranslateService } from '../../../../../../services/translate';

describe('ImgAltDuplicateTextLink#', () => {

  let fakeDom;
  const selector = 'a';

  new ImgAltDuplicateTextLink().registerValidator();

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

  it('should return 1 report when img element inside a link duplicates the text content of the link', () => {
    fakeDom.innerHTML = `
      <a href="http://example.com/">Test <img src="assets/img.png" alt="Test link" />link</a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAltDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('img_alt_duplicate_text_link_report_message'));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-alt-duplicate-text-link');
  });

  it('should return 1 report when img element inside a link duplicates the marked up text content of the link', () => {
    fakeDom.innerHTML = `
      <a href="http://example.com/">
        <img src="assets/img.png" alt="Some link text" />
        <span>Some</span> <em>link</em> <sup>text</sup>
      </a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAltDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('img_alt_duplicate_text_link_report_message'));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-alt-duplicate-text-link');
  });

  it('should return 1 report when img element inside a single nested element within a link duplicates the hierarchically marked up text content of the link', () => {
    fakeDom.innerHTML = `
      <a href="https://site.com">
        <span>
          <img src="/some-image.jpg" alt="Some link text">
          <span>Some <em>link <sup>text</sup></em></span>
        </span>
      </a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAltDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('img_alt_duplicate_text_link_report_message'));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-alt-duplicate-text-link');
  });

  it('should return 1 report when img element inside a sequence of nested elements within a link duplicates the marked up text content of the link', () => {
    fakeDom.innerHTML = `
      <a href="https://site.com">
        <span><span><img src="/some-image.jpg" alt="Some link text"> Some link text</span></span>
      </a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAltDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('img_alt_duplicate_text_link_report_message'));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-alt-duplicate-text-link');
  });

  it('should return no reports if img element inside a link is different from the text content of it', () => {
    fakeDom.innerHTML = '<a href="https://site.com"><img src="/some-image.jpg" alt="Different alt"> Some link text</a>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAltDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports if img element inside a link is different from the marked up text content of it', () => {
    fakeDom.innerHTML = '<a href="https://site.com"><span><img src="/some-image.jpg" alt="Different alt"> Some link text</span></a>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAltDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
