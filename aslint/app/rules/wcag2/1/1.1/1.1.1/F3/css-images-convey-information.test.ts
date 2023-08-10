import { CssImagesConveyInformation } from './css-images-convey-information';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { Css } from '../../../../../../utils/css';

describe('CssImagesConveyInformation', () => {

  let fakeDom;
  const SKIP_ELEMENTS: string[] = [
    ':not(html)',
    ':not(head)',
    ':not(title)',
    ':not(body)',
    ':not(link)',
    ':not(meta)',
    ':not(title)',
    ':not(style)',
    ':not(script)',
    ':not(noscript)',
    ':not(iframe)'
  ];

  const selector = `:root *${SKIP_ELEMENTS.join('')}`;

  new CssImagesConveyInformation().registerValidator();

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

  it('should return one report when there is an element with css images convey information', () => {
    fakeDom.innerHTML = '<div id="testElement" style="background-image: url(css-images-convey-information.png)">DIV</div>';

    const backgroundUrl = Css.getStyle(fakeDom.querySelector('#testElement'), 'background-image');
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(`A background image <code>${backgroundUrl}</code> is defined in CSS. Ensure that the image does not convey important information that is otherwise unavailable.`);
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('div');
    expect(Validator.getReport('report_0').ruleId).toBe('css-images-convey-information');
  });

  it('should return no reports when there is an element with css images convey information on body', () => {
    fakeDom.innerHTML = '<body style="background-image: url(css-images-convey-information.png)">Body</body>';
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information on link', () => {
    fakeDom.innerHTML = '<link style="background-image: url(css-images-convey-information.png)">link</link>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information on meta', () => {
    fakeDom.innerHTML = '<meta style="background-image: url(css-images-convey-information.png)">meta</meta>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information on style', () => {
    fakeDom.innerHTML = '<style style="background-image: url(css-images-convey-information.png)">style</style>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information on script', () => {
    fakeDom.innerHTML = '<script style="background-image: url(css-images-convey-information.png)"></script>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information on noscript', () => {
    fakeDom.innerHTML = '<noscript style="background-image: url(css-images-convey-information.png)">noscript</noscript>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information on iframe', () => {
    fakeDom.innerHTML = '<iframe style="background-image: url(css-images-convey-information.png)">iframe</iframe>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information none', () => {
    fakeDom.innerHTML = '<div style="background-image: none>none</div>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information display: none', () => {
    fakeDom.innerHTML = '<div style="display: none; background-image: url(css-images-convey-information.png)">display: none</div>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information visibility: hidden', () => {
    fakeDom.innerHTML = '<div style="visibility: hidden; background-image: url(css-images-convey-information.png)">visibility: hidden</div>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with css images convey information opacity: 0.09', () => {
    fakeDom.innerHTML = '<div style="opacity: 0.09; background-image: url(css-images-convey-information.png)">opacity: 0.09</div>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when there is an element with no direct text descendant', () => {
    fakeDom.innerHTML = '<div style="opacity: 0.09; background-image: url(css-images-convey-information.png)"></div>';

    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new CssImagesConveyInformation().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
