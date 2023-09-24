// nav

// ######## IMPORTS

// Playwright package.
const playwright = require('playwright');

// ######## CONSTANTS

// Strings in log messages indicating errors.
const errorWords = [
  'but not used',
  'content security policy',
  'deprecated',
  'error',
  'exception',
  'expected',
  'failed',
  'invalid',
  'missing',
  'non-standard',
  'not supported',
  'refused',
  'requires',
  'sorry',
  'suspicious',
  'unrecognized',
  'violates',
  'warning'
];

// ######## VARIABLES

let browser;

// ######## FUNCTIONS

// Returns a string with any final slash removed.
const deSlash = string => string.endsWith('/') ? string.slice(0, -1) : string;
// Gets the script nonce from a response.
const getNonce = async response => {
  let nonce = '';
  // If the response includes a content security policy:
  const headers = await response.allHeaders();
  const cspWithQuotes = headers && headers['content-security-policy'];
  if (cspWithQuotes) {
    // If it requires scripts to have a nonce:
    const csp = cspWithQuotes.replace(/'/g, '');
    const directives = csp.split(/ *; */).map(directive => directive.split(/ +/));
    const scriptDirective = directives.find(dir => dir[0] === 'script-src');
    if (scriptDirective) {
      const nonceSpec = scriptDirective.find(valPart => valPart.startsWith('nonce-'));
      if (nonceSpec) {
        // Return the nonce.
        nonce = nonceSpec.replace(/^nonce-/, '');
      }
    }
  }
  // Return the nonce, if any.
  return nonce;
};
// Visits a URL and returns the response of the server.
const goTo = async (report, page, url, timeout, waitUntil) => {
  // If the URL is a file path:
  if (url.startsWith('file://')) {
    // Make it absolute.
    url = url.replace('file://', `file://${__dirname.replace(/procs$/, '')}`);
  }
  // Visit the URL.
  const startTime = Date.now();
  try {
    const response = await page.goto(url, {
      timeout,
      waitUntil
    });
    report.jobData.visitLatency += Math.round((Date.now() - startTime) / 1000);
    const httpStatus = response.status();
    // If the response status was normal:
    if ([200, 304].includes(httpStatus) || url.startsWith('file:')) {
      // If the browser was redirected in violation of a strictness requirement:
      const actualURL = page.url();
      if (report.strict && deSlash(actualURL) !== deSlash(url)) {
        // Return an error.
        console.log(`ERROR: Visit to ${url} redirected to ${actualURL}`);
        return {
          exception: 'badRedirection'
        };
      }
      // Otherwise, i.e. if no prohibited redirection occurred:
      else {
        // Press the Escape key to dismiss any modal dialog.
        await page.keyboard.press('Escape');
        // Return the result of the navigation.
        return {
          success: true,
          response
        };
      }
    }
    // Otherwise, i.e. if the response status was abnormal:
    else {
      // Return an error.
      console.log(`ERROR: Visit to ${url} got status ${httpStatus}`);
      report.jobData.visitRejectionCount++;
      return {
        success: false,
        error: 'badStatus'
      };
    }
  }
  catch(error) {
    console.log(`ERROR visiting ${url} (${error.message.slice(0, 200)})`);
    return {
      success: false,
      error: 'noVisit'
    };
  }
};
// Closes the current browser.
const browserClose = async () => {
  if (browser) {
    const browserType = browser.browserType().name();
    let contexts = browser.contexts();
    for (const context of contexts) {
      await context.close();
      contexts = browser.contexts();
    }
    await browser.close();
    browser = null;
    console.log(`${browserType} browser closed`);
  }
};
// Launches a browser, navigates to a URL, and returns the status.
const launch = async (report, typeName, url, debug, waits, isLowMotion = false) => {
  // If the specified browser type exists:
  const browserType = playwright[typeName];
  if (browserType) {
    // Close the current browser, if any.
    await browserClose();
    // Launch a browser of the specified type.
    const browserOptions = {
      logger: {
        isEnabled: () => false,
        log: (name, severity, message) => console.log(message.slice(0, 100))
      }
    };
    if (debug) {
      browserOptions.headless = false;
    }
    if (waits) {
      browserOptions.slowMo = waits;
    }
    browser = await browserType.launch(browserOptions)
    // If the launch failed:
    .catch(async error => {
      healthy = false;
      console.log(`ERROR launching browser (${error.message.slice(0, 200)})`);
      // Return this.
      return {
        success: false,
        error: 'Browser launch failed'
      };
    });
    // Open a context (i.e. browser tab), with reduced motion if specified.
    const options = {reduceMotion: isLowMotion ? 'reduce' : 'no-preference'};
    browserContext = await browser.newContext(options);
    // When a page (i.e. browser tab) is added to the browser context (i.e. browser window):
    browserContext.on('page', async page => {
      // Make the page current.
      currentPage = page;
      // If it emits a message:
      page.on('console', msg => {
        const msgText = msg.text();
        let indentedMsg = '';
        // If debugging is on:
        if (debug) {
          // Log a summary of the message on the console.
          const parts = [msgText.slice(0, 75)];
          if (msgText.length > 75) {
            parts.push(msgText.slice(75, 150));
            if (msgText.length > 150) {
              const tail = msgText.slice(150).slice(-150);
              if (msgText.length > 300) {
                parts.push('...');
              }
              parts.push(tail.slice(0, 75));
              if (tail.length > 75) {
                parts.push(tail.slice(75));
              }
            }
          }
          indentedMsg = parts.map(part => `    | ${part}`).join('\n');
          console.log(`\n${indentedMsg}`);
        }
        // Add statistics on the message to the report.
        const msgTextLC = msgText.toLowerCase();
        const msgLength = msgText.length;
        report.jobData.logCount++;
        report.jobData.logSize += msgLength;
        if (errorWords.some(word => msgTextLC.includes(word))) {
          report.jobData.errorLogCount++;
          report.jobData.errorLogSize += msgLength;
        }
        const msgLC = msgText.toLowerCase();
        if (
          msgText.includes('403') && (msgLC.includes('status')
          || msgLC.includes('prohibited'))
        ) {
          report.jobData.prohibitedCount++;
        }
      });
    });
    // Open the first page of the context.
    currentPage = await browserContext.newPage();
    try {
      // Wait until it is stable.
      await currentPage.waitForLoadState('domcontentloaded', {timeout: 5000});
      // Navigate to the specified URL.
      const navResult = await goTo(report, currentPage, url, 15000, 'domcontentloaded');
      // If the navigation succeeded:
      if (navResult.success) {
        // Update the name of the current browser type and store it in the page.
        currentPage.browserTypeName = typeName;
        // Return the response, the browser context, and the page.
        return {
          success: true,
          response: navResult.response,
          browserContext,
          currentPage
        };
      }
      // If the navigation failed:
      if (navResult.error) {
        // Return this.
        return {
          success: false,
          error: 'Navigation failed'
        };
      }
    }
    // If it fails to become stable by the deadline:
    catch(error) {
      // Return this.
      console.log(`ERROR: Blank page load in new tab timed out (${error.message})`);
      return {
        success: false,
        error: 'Blank page load in new tab timed out'
      };
    }
  }
  // Otherwise, i.e. if it does not exist:
  else {
    // Return this.
    console.log(`ERROR: Browser of type ${typeName} could not be launched`);
    return {
      success: false,
      error: `${typeName} browser launch failed`
    };
  }
};
exports.browserClose = browserClose;
exports.getNonce = getNonce;
exports.goTo = goTo;
exports.launch = launch;
