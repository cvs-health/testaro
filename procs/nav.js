// nav

// ######## IMPORTS

// Playwright package.
const playwright = require('playwright');

// ######## FUNCTIONS

// Visits a URL and returns the response of the server.
const goTo = async (report, page, url, timeout, waitUntil) => {
  if (url.startsWith('file://')) {
    url = url.replace('file://', `file://${__dirname}/`);
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
        // Return the response.
        return response;
      }
    }
    // Otherwise, i.e. if the response status was abnormal:
    else {
      // Return an error.
      console.log(`ERROR: Visit to ${url} got status ${httpStatus}`);
      report.jobData.visitRejectionCount++;
      return {
        error: 'badStatus'
      };
    }
  }
  catch(error) {
    console.log(`ERROR visiting ${url} (${error.message.slice(0, 200)})`);
    return {
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
      console.log(`ERROR launching browser (${errorStart(error)})`);
      // Return this.
      return false;
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
    // Open the first page of the context and save it.
    currentPage = await browserContext.newPage();
    try {
      // Wait until it is stable.
      await currentPage.waitForLoadState('domcontentloaded', {timeout: 5000});
      // Navigate to the specified URL.
      const navResult = await goTo(report, currentPage, url, 15000, 'domcontentloaded');
      // If the navigation failed:
      if (navResult.error) {
        // Return this.
        return false;
      }
      // Otherwise, i.e. if it succeeded:
      else if (! navResult.error) {
        // Update the name of the current browser type and store it in the page.
        currentPage.browserTypeName = typeName;
        // Return success.
        return true;
      }
    }
    // If it fails to become stable by the deadline:
    catch(error) {
      // Return this.
      console.log(`ERROR: Blank page load in new tab timed out (${error.message})`);
      return false;
    }
  }
  // Otherwise, i.e. if it does not exist:
  else {
    // Return this.
    console.log(`ERROR: Browser of type ${typeName} could not be launched`);
    return false;
  }
};
exports.browserClose = browserClose;
exports.goTo = goTo;
exports.launch = launch;
