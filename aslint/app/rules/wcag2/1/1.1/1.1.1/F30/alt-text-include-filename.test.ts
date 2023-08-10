import { AltTextIncludeFilename } from './alt-text-include-filename';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { $auditRuleNodeSkipReason } from '../../../../../../constants/accessibility';

const RED_DOT_IMG = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

describe('AltTextIncludeFilename', () => {

  let fakeDom;
  const selector = '[alt]';

  new AltTextIncludeFilename().registerValidator();

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

  it('should return 1 report when there is an image with an alt attribute that contain filename', () => {
    fakeDom.innerHTML = `<img src="${RED_DOT_IMG}" alt="example.jpg"/>`;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new AltTextIncludeFilename().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe('The source filename of the image element must not be part of its text alternative (<code>alt="example.jpg"</code>).');
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('img');
    expect(Validator.getReport('report_0').ruleId).toBe('alt-text-include-filename');
  });

  it('should return no report when there is an image with an alt attribute that does not contain filename', () => {
    fakeDom.innerHTML = `<img src="${RED_DOT_IMG}" alt="Some example alternative description of the image"/>`;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);

    new AltTextIncludeFilename().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
