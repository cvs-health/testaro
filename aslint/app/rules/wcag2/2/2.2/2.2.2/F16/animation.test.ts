import { Animation } from './animation';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';

describe('Rules', () => {

  describe('Animation#', () => {

    let fakeDom;
    const selector = ':root *:not(head):not(script):not(iframe):not(:empty)';

    new Animation().registerValidator();

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

    it('should return 1 report when there is animation with animation-duration more than 5 seconds and animation-iteration-count: infinite', () => {
      fakeDom.innerHTML = '<style>' +
        '.blinking{animation-name:blinkingText; animation-duration: 6s; animation-iteration-count: infinite;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<span class="blinking">Am I blinking?</span>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined an animation duration in <code>6s</code> which is more than 5 seconds. You have defined an animation iteration count with <code>infinite</code> value. Make sure that there is a mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an activity where it is essential.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('span');
      expect(Validator.getReport('report_0').ruleId).toBe('animation');
    });

    it('should return 1 report when there is animation', () => {
      fakeDom.innerHTML = '<style>' +
        '.blinking{animation-name:blinkingText; animation-duration:5.001s;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<span class="blinking">Am I blinking?</span>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined an animation duration in <code>5.001s</code> which is more than 5 seconds. Make sure that there is a mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an activity where it is essential.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('span');
      expect(Validator.getReport('report_0').ruleId).toBe('animation');
    });

    it('should return no report when animation duration less than 4000ms', () => {
      fakeDom.innerHTML = '<style>' +
        '.blinking{animation:blinkingText 4000ms ;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<span class="blinking">Am I blinking?</span>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when animation duration less than 4s', () => {
      fakeDom.innerHTML = '<style>' +
        '.blinking{animation:blinkingText 4s ;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<span class="blinking">Am I blinking?</span>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when animationIterationCount is linear', () => {
      fakeDom.innerHTML = '<style>' +
        '.blinking{animation:blinkingText 4s linear ;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<span class="blinking">Am I blinking?</span>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when styled element is script', () => {
      fakeDom.innerHTML = '<style>' +
        '.blinking{animation:blinkingText 6s linear ;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<script class="blinking">Am I blinking?</script>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when styled element is iframe', () => {
      fakeDom.innerHTML = '<style>' +
        '.blinking{animation:blinkingText 6s linear ;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<iframe class="blinking">Am I blinking?</iframe>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when styled element is empty', () => {
      fakeDom.innerHTML = '<style>' +
        '.blinking{animation:blinkingText 6s linear ;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<p class="blinking"></p>';

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when styled element is empty', () => {

      fakeDom.innerHTML = '<style>' +
        '.blinking{animation:blinkingText 6s linear ;}' +
        '@keyframes blinkingText{' +
        '0%{color: #000;}' +
        '49%{color: #000;}' +
        '60%{color: transparent;}' +
        '99%{color:transparent;}' +
        '100%{color: #000;}} </style>' +
        '<meta class="blinking">Meta</meta>';
      document.head.appendChild(fakeDom);

      Validator.reset();

      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

      new Animation().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
