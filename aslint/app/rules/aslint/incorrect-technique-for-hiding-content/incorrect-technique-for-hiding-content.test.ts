import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';
import { IncorrectTechniqueForHidingContent } from './incorrect-technique-for-hiding-content';

describe('Rules', () => {

  describe('IncorrectTechniqueForHidingContent', () => {

    it('should indicate that class exists', () => {
      expect(IncorrectTechniqueForHidingContent).toBeDefined();
    });

    let fakeDom;

    new IncorrectTechniqueForHidingContent().registerValidator();

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

    // Note: untestable until https://github.com/facebook/jest/issues/11291 gets resolved

    /*
     *
     *it('should return 1 report when there is an element with defined style text-indent: -1000px;', () => {
     *  fakeDom.innerHTML = '<p style="text-indent: -1000px">Example text</p>';
     *  const nodes: HTMLParagraphElement[] = DomUtility.querySelectorAllExclude('p', fakeDom) as HTMLParagraphElement[];
     *
     *  new IncorrectTechniqueForHidingContent().validate(nodes);
     *
     *  expect(Object.keys(Validator.getReports()).length).toBe(1);
     *  expect(Validator.getReport('report_0').message).toBe('CSS technique <code>text-indent: -1000px </code> is used to hide text. However, it causes problems for right-to-left language and also keep focus for screen reader outside of visible area.');
     *  expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
     *  expect(Validator.getReport('report_0').ruleId).toBe('incorrect-technique-for-hiding-content');
     *});
     *
     *it('should return 1 report when there is an element with defined style text-indent: 1000px;', () => {
     *  fakeDom.innerHTML = '<p style="text-indent: 1000px">Example text</p>';
     *  const nodes: HTMLParagraphElement[] = DomUtility.querySelectorAllExclude('p', fakeDom) as HTMLParagraphElement[];
     *
     *  new IncorrectTechniqueForHidingContent().validate(nodes);
     *
     *  expect(Object.keys(Validator.getReports()).length).toBe(1);
     *  expect(Validator.getReport('report_0').message).toBe('CSS technique <code>text-indent: 1000px </code> is used to hide text. However, it causes problems for right-to-left language and also keep focus for screen reader outside of visible area.');
     *  expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
     *  expect(Validator.getReport('report_0').ruleId).toBe('incorrect-technique-for-hiding-content');
     *});
     *
     *it('should return no report when there is an element with no defined style text-indent', () => {
     *  fakeDom.innerHTML = '<p>Example text</p>';
     *  const nodes: HTMLParagraphElement[] = DomUtility.querySelectorAllExclude('p', fakeDom) as HTMLParagraphElement[];
     *
     *  new IncorrectTechniqueForHidingContent().validate(nodes);
     *
     *  expect(Object.keys(Validator.getReports()).length).toBe(0);
     *});
     *
     *it('should return no report when there is an element with defined style text-indent that doesn\'t move content outside of visible area', () => {
     *  const createMockDiv = (width, height) => {
     *    const div = document.createElement('div');
     *
     *    Object.assign(div.style, {
     *      height: `${height}px`,
     *      width: `${width}px`
     *    });
     *
     *    div.getBoundingClientRect = () => {
     *      return {
     *        bottom: height,
     *        height,
     *        left: 0,
     *        right: width,
     *        toJSON: () => { },
     *        top: 0,
     *        width,
     *        x: 0,
     *        y: 0
     *      };
     *    };
     *
     *    return div;
     *  };
     *
     *  const div = createMockDiv(100, 100);
     *
     *  div.innerText = 'Example text';
     *  div.style.textIndent = '-1rem';
     *
     *  fakeDom.appendChild(div);
     *
     *  const nodes: HTMLDivElement[] = DomUtility.querySelectorAllExclude('div', fakeDom) as HTMLDivElement[];
     *
     *  global.innerHeight = 500;
     *  global.innerWidth = 500;
     *
     *  new IncorrectTechniqueForHidingContent().validate(nodes);
     *
     *  expect(Object.keys(Validator.getReports()).length).toBe(0);
     *});
     *
     */

  });
});
