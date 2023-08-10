import { DomUtility } from '../../../../../../utils/dom';
import { Validator } from '../../../../../../validator';
import { LinksNotVisuallyEvidentWithoutColorVision } from './links-not-visually-evident-without-color-vision';

describe('Rules', () => {

  describe('LinksNotVisuallyEvidentWithoutColorVision#', () => {

    let fakeDom;
    const selector = 'a:not(:empty)';

    new LinksNotVisuallyEvidentWithoutColorVision().registerValidator();

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

    it('should return no report when there is a link with different styles as parent element', () => {
      fakeDom.innerHTML = '<p id="parentElement">This is an example <a href="#test" id="link">link</a></p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);
      const wrapper: HTMLParagraphElement = document.querySelector('#parentElement');

      wrapper.style.color = 'black';
      wrapper.style.background = 'white';
      wrapper.style.fontStyle = 'normal';
      wrapper.style.textDecoration = 'none';

      const anchor: HTMLAnchorElement = wrapper.querySelector('#link');

      anchor.style.color = 'black';
      anchor.style.background = 'yellow';
      anchor.style.fontStyle = 'normal';
      anchor.style.textDecoration = 'none';

      new LinksNotVisuallyEvidentWithoutColorVision().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return 1 report when there is a link with the same styles as parent element', () => {
      fakeDom.innerHTML = '<p id="parentElement">This is an example <a href="#test" id="link">link</a></p>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom);
      const wrapper: HTMLParagraphElement = document.querySelector('#parentElement');

      wrapper.style.color = 'black';
      wrapper.style.background = 'yellow';
      wrapper.style.fontStyle = 'normal';
      wrapper.style.textDecoration = 'none';

      const anchor: HTMLAnchorElement = wrapper.querySelector('#link');

      anchor.style.color = 'black';
      anchor.style.background = 'yellow';
      anchor.style.fontStyle = 'normal';
      anchor.style.textDecoration = 'none';

      new LinksNotVisuallyEvidentWithoutColorVision().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Ensure links are understandable and distinguishable from their surrounding text. Parent element has styles <code>background: yellow; color: black; font-style: normal; text-decoration: none</code>, while anchor has styles <code>background: yellow; color: black; font-style: normal; text-decoration: none</code>. Change the styles to differentiate between them.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('a');
      expect(Validator.getReport('report_0').ruleId).toBe('links-not-visually-evident-without-color-vision');
    });

  });
});
