import { DomUtility } from '../../../utils/dom';
import { Validator } from '../../../validator';
import { Overlay } from './overlay';

describe('Rules', () => {

  describe('Overlay', () => {

    it('should indicate that class exists', () => {
      expect(Overlay).toBeDefined();
    });

    let fakeDom;

    new Overlay().registerValidator();

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

    it('should return 1 report when there is one known Overlay detected', () => {
      fakeDom.innerHTML = '<script src="https://cdn.userway.org/widget.js"></script>';
      const nodes = DomUtility.querySelectorAllExclude('script', fakeDom) as HTMLScriptElement[];

      new Overlay().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Accessibility overlay UserWay has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_0').ruleId).toBe('overlay');
    });

    it('should return 1 report when there is one known Overlay detected inside HTML', () => {
      fakeDom.innerHTML = '<div data-src="https://cdn.userway.org/widget.js"></div>';
      const nodes = DomUtility.querySelectorAllExclude('script', fakeDom) as HTMLScriptElement[];

      new Overlay().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('Accessibility overlay UserWay has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('html');
      expect(Validator.getReport('report_0').ruleId).toBe('overlay');
    });

    it('should return reports for all known detected overlays', () => {
      let overlays: string = '';

      overlays += '<script src="https://cdn.acsbap.com/widget.js"></script>';
      overlays += '<script src="https://cdn.acsbapp.com/widget.js"></script>';
      overlays += '<script src="https://cdn.audioeye.com/widget.js"></script>';
      overlays += '<script src="https://cdn.nagich.com/widget.js"></script>';
      overlays += '<script src="https://cdn.nagich.co.il/widget.js"></script>';
      overlays += '<script src="https://cdn.maxaccess.io/widget.js"></script>';
      overlays += '<script src="https://cdn.truabilities.com/widget.js"></script>';
      overlays += '<script src="https://cdn.user1st.info/widget.js"></script>';
      overlays += '<script src="https://cdn.userway.org/widget.js"></script>';

      fakeDom.innerHTML = overlays;

      const nodes = DomUtility.querySelectorAllExclude('script', fakeDom) as HTMLScriptElement[];

      new Overlay().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(9);

      expect(Validator.getReport('report_0').message).toBe('Accessibility overlay AccessiBe has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_0').ruleId).toBe('overlay');

      expect(Validator.getReport('report_1').message).toBe('Accessibility overlay AccessiBe has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_1').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_1').ruleId).toBe('overlay');

      expect(Validator.getReport('report_2').message).toBe('Accessibility overlay AudioEye has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_2').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_2').ruleId).toBe('overlay');

      expect(Validator.getReport('report_3').message).toBe('Accessibility overlay EqualWeb has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_3').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_3').ruleId).toBe('overlay');

      expect(Validator.getReport('report_4').message).toBe('Accessibility overlay EqualWeb has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_4').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_4').ruleId).toBe('overlay');

      expect(Validator.getReport('report_5').message).toBe('Accessibility overlay MaxAccess has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_5').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_5').ruleId).toBe('overlay');

      expect(Validator.getReport('report_6').message).toBe('Accessibility overlay TruAbilities has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_6').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_6').ruleId).toBe('overlay');

      expect(Validator.getReport('report_7').message).toBe('Accessibility overlay User1st has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_7').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_7').ruleId).toBe('overlay');

      expect(Validator.getReport('report_8').message).toBe('Accessibility overlay UserWay has been detected on the page. Overlays are third-party widgets that attempt to automatically fix the accessibility issues of page they are added to. Therefore the results from the scanning may not be accurate.');
      expect(Validator.getReport('report_8').node.nodeName.toLowerCase()).toBe('script');
      expect(Validator.getReport('report_8').ruleId).toBe('overlay');
    });

    it('should return no reports when there are no overlays on the page', () => {
      fakeDom.innerHTML = '<script src="empty.js"></script>';
      const nodes = DomUtility.querySelectorAllExclude('script', fakeDom) as HTMLScriptElement[];

      new Overlay().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
