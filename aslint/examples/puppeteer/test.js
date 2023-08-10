const fs = require('fs');
const path = require('path');
const util = require('util');

const puppeteer = require('puppeteer');

const puppeteerWaitUntil = {
  domContentLoaded: 'domcontentloaded',
  load: 'load',
  networkIdle0: 'networkidle0',
  networkIdle2: 'networkidle2'
};

const PuppeteerErrors = {
  InvalidSSLcertificate: 'net::ERR_CERT_COMMON_NAME_INVALID',
  NameNotResolved: 'net::ERR_NAME_NOT_RESOLVED',
  TimeoutError: 'TimeoutError'
};

const runASLint = async () => {
  const browser = await puppeteer.launch({
    args: [
      // '--auto-open-devtools-for-tabs',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    headless: true,
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();

  page.on('requestfailed', (request) => {
    console.log(
      `url: ${request.url()}, errText: ${
        request.failure().errorText
      }, method: ${request.method()}`
    );
  });

  page.on('pageerror', (err) => {
    console.log(`Page error: ${err.toString()}`);
  });

  page.on('console', (msg) => {
    console.log(`Logger: ${msg.type()} ${msg.text()} ${msg.location()}`);
  });

  const onGotoError = (error) => {
    if (error.name === PuppeteerErrors.TimeoutError) {
      if (isDomLoaded && pageResponse !== null) {
        console.log(
          '[runASLint.onGotoError] DOM loaded, page response available, but timeout has been reached',
          url
        );

        return pageResponse;
      }
    }

    console.error(
      '[runASLint.onGotoError] error navigating',
      error,
      'url:',
      url
    );

    return Promise.reject(error);
  };

  const waitAfterGoto = (_resp) => {
    return _resp;
  };

  let aslintBundle;

  await fs.promises
    .readFile(path.resolve(__dirname, '../../dist/aslint.bundle.js'), {
      encoding: 'utf8'
    })
    .then((fileData) => {
      aslintBundle = fileData;
    })
    .catch((err) => {
      console.error(err);
    });

  const getAslintCallback = () => {
    return `window.aslint
                .config({ asyncRunner: false })
                .run()
                .then((results) => { window.aslint.newResults = results })
                .catch(e => window.aslint.newResults = { aslintError: e })`;
  };

  const aslintCallback = getAslintCallback();

  await page.setViewport({
    height: 1080,
    width: 1920
  });

  const puppeteerOptions = {
    waitUntil: puppeteerWaitUntil.networkIdle2
  };

  await page
    .goto('https://www.w3.org/WAI/demos/bad/before/home.html', puppeteerOptions)
    .catch(onGotoError)
    .then(waitAfterGoto);

  await page.addScriptTag({
    content: aslintBundle
  });

  await page.addScriptTag({
    content: aslintCallback
  });

  await page.waitForFunction('window.aslint.newResults');

  const getReport = () => {
    return window.aslint.newResults;
  };

  const result = await page.evaluate(getReport);

  console.log(util.inspect(result, false, null, true));

  await browser.close();
};

runASLint();
