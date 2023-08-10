import { AutoplayAudioVideo } from './autoplay-audio-video';
import { Validator } from '../../../../../validator';
import { DomUtility } from '../../../../../utils/dom';

describe('Rules', () => {

  describe('AutoplayAudioVideo#', () => {

    let fakeDom;
    const selector = 'iframe[allow*="autoplay=1"], iframe[src*="autoplay=1"], [autoplay]';

    new AutoplayAudioVideo().registerValidator();

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

    it('should return 1 report when there is audio autoplay', () => {
      fakeDom.innerHTML = '<audio autoplay><source src="horse.ogg" type="audio/ogg"></audio>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLMediaElement[];

      new AutoplayAudioVideo().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>autoplay="true"</code>. Individuals who use screen reading software can find it hard to hear the speech output if there is other audio playing at the same time. Allow the user to turn off videos/sounds (especially if they last more than 3 seconds) that start automatically when a page loads.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('audio');
      expect(Validator.getReport('report_0').ruleId).toBe('autoplay-audio-video');
    });

    it('should return 1 report when there is video autoplay', () => {
      fakeDom.innerHTML = '<video autoplay><source src="movie.mp4" type="video/mp4"></video>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLMediaElement[];

      new AutoplayAudioVideo().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>autoplay="true"</code>. Individuals who use screen reading software can find it hard to hear the speech output if there is other audio playing at the same time. Allow the user to turn off videos/sounds (especially if they last more than 3 seconds) that start automatically when a page loads.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('video');
      expect(Validator.getReport('report_0').ruleId).toBe('autoplay-audio-video');
    });


    it('should return 1 report when there is iframe with attribute allow that contains autoplay', () => {
      fakeDom.innerHTML = '<iframe src="https://player.vimeo.com/video/76979871?autoplay=1&loop=1&autopause=0" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLMediaElement[];

      new AutoplayAudioVideo().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('iframe');
    });

    it('should return 1 report when there is iframe with attribute allow that contains autoplay', () => {
      fakeDom.innerHTML = '<iframe src="https://player.vimeo.com/video/76979871?autoplay=1&loop=1&autopause=0" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLMediaElement[];

      new AutoplayAudioVideo().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('iframe');
    });

    it('should return 1 report when there is iframe with url query parameter autoplay=1', () => {
      fakeDom.innerHTML = '<iframe src="https://player.vimeo.com/video/305795958?background=1&autoplay=1&;title=0&;byline=0&;portrait=0&;loop=1&;autopause=0&;muted=1" width="640" height="360" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLMediaElement[];

      new AutoplayAudioVideo().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('iframe');
    });

    it('should return no report when there is no audio autoplay', () => {
      fakeDom.innerHTML = '<audio><source src="horse.ogg" type="audio/ogg"></audio>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLMediaElement[];

      new AutoplayAudioVideo().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when there is no video autoplay', () => {
      fakeDom.innerHTML = '<video><source src="movie.mp4" type="video/mp4"></video>';
      const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLMediaElement[];

      new AutoplayAudioVideo().validate(nodes);

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
