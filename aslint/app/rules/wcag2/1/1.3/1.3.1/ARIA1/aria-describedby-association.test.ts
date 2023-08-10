import { AriaDescribedbyAssociation } from './aria-describedby-association';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('AriaDescribedbyAssociation#', () => {

    let fakeDom;
    const selector = 'iframe';

    new AriaDescribedbyAssociation().registerValidator();

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

    it('should return 2 report when aria-describedby has no appropriate id and aria-describedby is empty', () => {

      fakeDom.innerHTML = '<iframe aria-describedby="main"></iframe><iframe aria-describedby></iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLIFrameElement[];

      new AriaDescribedbyAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(2);
      expect(Validator.getReport('report_0').message).toBe('There is no element with attribute <code>id=\'main\'</code>, which is referred-to by <code>aria-describedby="main"</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('iframe');
      expect(Validator.getReport('report_0').ruleId).toBe('aria-describedby-association');
      expect(Validator.getReport('report_1').message).toBe('Expected attribute <code>aria-describedby</code> not to be empty on element <code>&lt;iframe aria-describedby&#x3D;&quot;&quot;&gt;&lt;&#x2F;iframe&gt;</code>');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('iframe');
      expect(Validator.getReport('report_1').ruleId).toBe('aria-describedby-association');
    });

    it('should return 1 report when aria-describedby has no appropriate id', () => {


      fakeDom.innerHTML = '<iframe aria-describedby="main"></iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLIFrameElement[];

      new AriaDescribedbyAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('There is no element with attribute <code>id=\'main\'</code>, which is referred-to by <code>aria-describedby="main"</code>.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('iframe');
      expect(Validator.getReport('report_0').ruleId).toBe('aria-describedby-association');
    });

    it('should return 1 report when aria-describedby has no appropriate id and has empty value', () => {

      fakeDom.innerHTML = '<iframe aria-describedby=""></iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLIFrameElement[];

      new AriaDescribedbyAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>aria-describedby</code> not to be empty on element <code>&lt;iframe aria-describedby&#x3D;&quot;&quot;&gt;&lt;&#x2F;iframe&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('iframe');
      expect(Validator.getReport('report_0').ruleId).toBe('aria-describedby-association');
    });

    it('should return 1 report when aria-describedby has no appropriate id and is empty', () => {

      fakeDom.innerHTML = '<iframe aria-describedby></iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLIFrameElement[];

      new AriaDescribedbyAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Expected attribute <code>aria-describedby</code> not to be empty on element <code>&lt;iframe aria-describedby&#x3D;&quot;&quot;&gt;&lt;&#x2F;iframe&gt;</code>');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('iframe');
      expect(Validator.getReport('report_0').ruleId).toBe('aria-describedby-association');
    });

    it('should return no report when there is aria-describedby with appropriated id', () => {

      fakeDom.innerHTML = '<div id="main">Main</div><iframe aria-describedby="main"></iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLIFrameElement[];

      new AriaDescribedbyAssociation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
