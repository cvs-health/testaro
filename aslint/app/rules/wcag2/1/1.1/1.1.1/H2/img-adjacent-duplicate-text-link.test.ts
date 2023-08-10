import { ImgAdjacentDuplicateTextLink } from './img-adjacent-duplicate-text-link';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { TranslateService } from '../../../../../../services/translate';

describe('ImgAdjacentDuplicateTextLink#', () => {

  let fakeDom;
  const selector = 'a';

  new ImgAdjacentDuplicateTextLink().registerValidator();

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

  it('should return one report when img element inside a link uses alt text that duplicates the text content of the link right AFTER it', () => {
    fakeDom.innerHTML = `
      <a href="http://example.com/">
        <img src="assets/img.png" alt="Test link" />
      </a>
      <a href="http://example.com/">Test link</a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAdjacentDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('img_adjacent_duplicate_text_link_report_message_1'));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-adjacent-duplicate-text-link');
  });

  it('should return one report when img element inside a link uses alt text that duplicates the text content of the link right BEFORE it', () => {
    fakeDom.innerHTML = `
      <a href="http://example.com/">Test link</a>
      <a href="http://example.com/">
        <img src="assets/img.png" alt="Test link" />
      </a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAdjacentDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('img_adjacent_duplicate_text_link_report_message_1'));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-adjacent-duplicate-text-link');
  });

  it('should return one report when standalone img element inside a link has empty alt text when a link beside it contains link text', () => {
    fakeDom.innerHTML = `
      <a href="http://example.com/">Test link</a>
      <a href="http://example.com/">
        <img src="assets/img.png" alt="" />
      </a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAdjacentDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('img_adjacent_duplicate_text_link_report_message_2'));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
    expect(Validator.getReport('report_0').ruleId).toBe('img-adjacent-duplicate-text-link');
  });

  it('should return no reports when adjacent links have different hrefs', () => {
    fakeDom.innerHTML = `
      <a href="http://example.com/">
        <img src="assets/img.png" alt="Test link" />
      </a>
      <a href="http://example.com/?rand=123">Test link</a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAdjacentDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when two links that are otherwise reported as duplicating, have non-empty content in between them', () => {
    fakeDom.innerHTML = `
      <a href="http://example.com/">Test link</a>
      <em>Test</em>
      <span>Lorem ipsum...</span>
      <a href="http://example.com/">
        <img src="assets/img.png" alt="Test link" />
      </a>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLAnchorElement[];

    new ImgAdjacentDuplicateTextLink().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
