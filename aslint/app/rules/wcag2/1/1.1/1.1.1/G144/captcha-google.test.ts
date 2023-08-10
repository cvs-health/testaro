import { Validator } from '../../../../../../validator';
import { DomUtility } from '../../../../../../utils/dom';
import { Global } from '../../../../../../utils/global';
import { CaptchaGoogle } from './captcha-google';

describe('CaptchaGoogle#', () => {
  let fakeDom;

  new CaptchaGoogle().registerValidator();

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

  it('should not return if reCAPTCHA does not exist on webpage', () => {
    fakeDom.innerHtml = `<div></div>`;

    new CaptchaGoogle().run(fakeDom);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });

  it('should return an error if reCAPTCHA V2 detected', () => {
    Global.context.grecaptcha = {
      getResponse: () => {
        return 'someToken';
      }
    };

    fakeDom.innerHTML = `<div>
      <iframe
        src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LfW6wATAAAAAHLqO2pb8bDBahxlMxNdo9g947u9&amp;co=aHR0cHM6Ly9yZWNhcHRjaGEtZGVtby5hcHBzcG90LmNvbTo0NDM.&amp;hl=en&amp;v=aUMtGvKgJZfNs4PdY842Qp03&amp;size=normal&amp;cb=6ytryc8i51fv" role="presentation" name="a-ckyb7pprecxj" scrolling="no" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
        width="304" height="78" frameborder="0"
      ></iframe>
      <iframe
        title="recaptcha challenge"
        src="https://www.google.com/recaptcha/api2/bframe?hl=en&amp;v=aUMtGvKgJZfNs4PdY842Qp03&amp;k=6LfW6wATAAAAAHLqO2pb8bDBahxlMxNdo9g947u9&amp;cb=q99hr0dbxm2c"
        style="width: 100%; height: 100%;" name="c-ckyb7pprecxj" scrolling="no" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" frameborder="0"
      ></iframe>
    </div>`;

    new CaptchaGoogle().run(fakeDom);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
  });

  it('should return an error if invisible reCAPTCHA V2 detected', () => {
    Global.context.grecaptcha = {
      getResponse: () => {
        return '';
      }
    };

    fakeDom.innerHTML = `<div>
      <div style="visibility: hidden;">
        <iframe
          src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LcmDCcUAAAAAL5QmnMvDFnfPTP4iCUYRk2MwC0-&amp;co=aHR0cHM6Ly9yZWNhcHRjaGEtZGVtby5hcHBzcG90LmNvbTo0NDM.&amp;hl=en&amp;v=aUMtGvKgJZfNs4PdY842Qp03&amp;size=invisible&amp;cb=dabnaen0b7yo" role="presentation" name="a-kew07dm8a4n2"
          scrolling="no" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" width="256" height="60" frameborder="0"
        ></iframe>
      </div>
      <iframe
        title="recaptcha challenge" src="https://www.google.com/recaptcha/api2/bframe?hl=en&amp;v=aUMtGvKgJZfNs4PdY842Qp03&amp;k=6LcmDCcUAAAAAL5QmnMvDFnfPTP4iCUYRk2MwC0-&amp;cb=74qacmgg1hgy"
        style="width: 100%; height: 100%;" name="c-kew07dm8a4n2" scrolling="no" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" frameborder="0"
      ></iframe>
    </div>`;

    new CaptchaGoogle().run(fakeDom);

    expect(Object.keys(Validator.getReports()).length).toBe(1);
  });

  it('should not return an error if reCAPTCHA V3 detected', () => {
    Global.context.grecaptcha = {
      getResponse: () => {
        throw new Error('No reCAPTCHA clients exist.');
      }
    };

    fakeDom.innerHTML = `<div>
      <iframe
        src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LdyC2cUAAAAACGuDKpXeDorzUDWXmdqeg-xy696&amp;co=aHR0cHM6Ly9yZWNhcHRjaGEtZGVtby5hcHBzcG90LmNvbTo0NDM.&amp;hl=en&amp;v=aUMtGvKgJZfNs4PdY842Qp03&amp;size=invisible&amp;cb=b2s0afzhbrlp" role="presentation" name="a-mqdbvmltfhmg" scrolling="no" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
        width="256" height="60" frameborder="0"
      ></iframe>
    </div>`;

    new CaptchaGoogle().run(fakeDom);

    expect(Object.keys(Validator.getReports()).length).toBe(0);
  });
});
