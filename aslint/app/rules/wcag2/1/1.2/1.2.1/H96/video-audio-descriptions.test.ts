import { VideoAudioDescriptions } from './video-audio-descriptions';
import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { TextUtility } from '../../../../../../utils/text';
import { TranslateService } from '../../../../../../services/translate';

describe('VideoAudioDescriptions#', () => {

  let fakeDom;
  const selector = 'audio, video';

  new VideoAudioDescriptions().registerValidator();

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

  it('should return one report when both descriptions track and audio source(s) for the video are absent', () => {
    fakeDom.innerHTML = `
      <video poster="myvideo.png" controls>
        <source src="myvideo.mp4" srclang="en" type="video/mp4">
      </video>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLVideoElement[];

    new VideoAudioDescriptions().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
    expect(Validator.getReport('report_0').message).toBe(TranslateService.instant('video_audio_descriptions_report_message', [TextUtility.escape('<track>'), TextUtility.escape('<source>')]));
    expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('video');
    expect(Validator.getReport('report_0').ruleId).toBe('video-audio-descriptions');
  });

  it('should return no reports when video has audio source(s)', () => {
    fakeDom.innerHTML = `
      <video poster="myvideo.png" controls>
        <source src="myvideo.mp4" srclang="en" type="video/mp4">
        <source src="myaudio.ogg" type="audio/ogg">
        <source src="myaudio.mp3" type="audio/mpeg">
      </video>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLVideoElement[];

    new VideoAudioDescriptions().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when video has descriptions track', () => {
    fakeDom.innerHTML = `
      <video poster="myvideo.png" controls>
        <source src="myvideo.mp4" srclang="en" type="video/mp4">
        <track src="myvideo_en.vtt" kind="descriptions" srclang="en" label="English">
      </video>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLVideoElement[];

    new VideoAudioDescriptions().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return no reports when video has both descriptions track and audio source(s)', () => {
    fakeDom.innerHTML = `
      <video poster="myvideo.png" controls>
        <source src="myvideo.mp4" srclang="en" type="video/mp4">
        <source src="myaudio.ogg" type="audio/ogg">
        <source src="myaudio.mp3" type="audio/mpeg">
        <track src="myvideo_en.vtt" kind="descriptions" srclang="en" label="English">
       </video>
    `;
    const nodes = DomUtility.querySelectorAllExclude(selector, fakeDom) as HTMLVideoElement[];

    new VideoAudioDescriptions().validate(nodes);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

});
