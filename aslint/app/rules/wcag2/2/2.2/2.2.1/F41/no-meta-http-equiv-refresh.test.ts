import { NoMetaHttpEquivRefresh } from './no-meta-http-equiv-refresh';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('NoMetaHttpEquivRefresh#', () => {

    let fakeDom;
    const selector = 'meta';

    new NoMetaHttpEquivRefresh().registerValidator();

    beforeEach(() => {
      fakeDom = document.createElement('meta');
      fakeDom.id = 'fakedom';
      document.head.appendChild(fakeDom);

      Validator.reset();
    });

    afterEach(() => {
      DomUtility.remove(document.getElementById('fakedom'));
      fakeDom = undefined;
    });

    it('should return one report when there is meta with http-equiv=\'refresh\'', () => {
      fakeDom.httpEquiv = 'refresh';
      fakeDom.content = '60';

      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new NoMetaHttpEquivRefresh().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>http-equiv="refresh"</code>. Remove this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('no-meta-http-equiv-refresh');
    });

    it('should return one report when there is meta with http-equiv=\'Refresh\'', () => {
      fakeDom.httpEquiv = 'Refresh';
      fakeDom.content = '60';

      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new NoMetaHttpEquivRefresh().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>http-equiv="refresh"</code>. Remove this element.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('meta');
      expect(Validator.getReport('report_0').ruleId).toBe('no-meta-http-equiv-refresh');
    });

    it('should return no reports when there is meta with http-equiv=\'refreshing\'', () => {
      fakeDom.httpEquiv = 'refreshing';
      fakeDom.content = '60';

      const nodes = DomUtility.querySelectorAllExclude(selector) as HTMLMetaElement[];

      new NoMetaHttpEquivRefresh().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
