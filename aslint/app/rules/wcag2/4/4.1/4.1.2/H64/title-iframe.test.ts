import { TitleiFrame } from './title-iframe';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('TitleiFrame', () => {

    let fakeDom;
    const selector = 'iframe, object';

    new TitleiFrame().registerValidator();

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

    it('should return 1 report when there is a iframe without title', () => {
      fakeDom.innerHTML = '<iframe>Iframe1</iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new TitleiFrame().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected <code>title</code> attribute to be defined on <code>iframe</code>. However, if it is an <code>iframe</code> without valuable content for the user then add the attribute <code>aria-hidden="true"</code> in order to hide it from assistive technologies.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('iframe');
      expect(Validator.getReport('report_0').ruleId).toBe('title-iframe');
    });

    it('should return no report when there is an iframe with title', () => {
      fakeDom.innerHTML = '<iframe title="iframe">Iframe1</iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new TitleiFrame().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is an object with title', () => {
      fakeDom.innerHTML = '<object title="object">Object1</object>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new TitleiFrame().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
