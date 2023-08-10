import { RoleApplication } from './role-application';
import { Validator } from '../../../validator';
import { DomUtility } from '../../../utils/dom';

describe('Rules', () => {

  describe('RoleApplication', () => {

    let fakeDom;

    new RoleApplication().registerValidator();

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

    it('should return correct data for p with role="application"', () => {
      fakeDom.innerHTML = '<p role="application"></p>';
      const nodes = DomUtility.querySelectorAllExclude('[role="application"]', fakeDom) as HTMLElement[];

      new RoleApplication().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Use <code>role="application"</code> carefully as it is used to denote a region of a web application that is to be treated like a desktop application, not like a regular web page.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('p');
      expect(Validator.getReport('report_0').ruleId).toBe('role-application');
    });

    it('should return no reports in case no elements with p with role="application"', () => {
      fakeDom.innerHTML = '<p>Test</p>';
      const nodes = DomUtility.querySelectorAllExclude('[role="application"]', fakeDom) as HTMLElement[];

      new RoleApplication().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
