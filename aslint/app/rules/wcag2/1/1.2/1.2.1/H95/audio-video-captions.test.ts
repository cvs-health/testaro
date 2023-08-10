import { AudioVideoCaptions } from './audio-video-captions';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';

describe('AudioVideoCaptions#', () => {

  let fakeDom;
  const selector = 'audio, video';

  new AudioVideoCaptions().registerValidator();

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

  it('should return one report when captions for the audio are absent', () => {
    fakeDom.innerHTML = `
      <audio controls>
        <source src="myaudio.ogg" type="audio/ogg">
        <source src="myaudio.mp3" type="audio/mpeg">
      </audio>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new AudioVideoCaptions().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('audio_video_captions_report_message', [TextUtility.escape('<track>')]));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('audio');
    expect(Validator.getReport('report_0').ruleId).toBe('audio-video-captions');
  });

  it('should return one report when captions for the video are absent', () => {
    fakeDom.innerHTML = `
      <video poster="myvideo.png" controls>
        <source src="myvideo.mp4" srclang="en" type="video/mp4">
      </video>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new AudioVideoCaptions().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('audio_video_captions_report_message', [TextUtility.escape('<track>')]));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('video');
    expect(Validator.getReport('report_0').ruleId).toBe('audio-video-captions');
  });

  it('should return no reports when captions for the audio are defined', () => {
    fakeDom.innerHTML = `
      <audio controls>
        <source src="myaudio.ogg" type="audio/ogg">
        <source src="myaudio.mp3" type="audio/mpeg">
        <track src="myaudio_en.vtt" kind="captions" srclang="en" label="English">
      </audio>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new AudioVideoCaptions().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when captions for the video are defined', () => {
    fakeDom.innerHTML = `
      <video poster="myvideo.png" controls>
        <source src="myvideo.mp4" srclang="en" type="video/mp4">
        <track src="myvideo_en.vtt" kind="captions" srclang="en" label="English">
      </video>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLElement[];

    new AudioVideoCaptions().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
