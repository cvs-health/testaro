/*
  index.js
  autotest main script.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs/promises');
// Module to keep secrets local.
require('dotenv').config();
// Module to create an HTTP server and client.
const http = require('http');
// Module to create an HTTPS server and client.
const https = require('https');
// Requirements for commands.
const {commands} = require('./commands');
// ########## CONSTANTS
// Set debug to true to add debugging features.
const debug = false;
// Set waits to a positive number to insert delays (in ms).
const waits = 0;
const protocol = process.env.PROTOCOL || 'https';
// Files servable without modification.
const statics = {
  '/style.css': 'text/css'
};
// URLs to be redirected.
const redirects = {
  '/': '/autotest/index.html'
};
// Pages to be served as error notifications.
const customErrorPageStart = [
  '<html lang="en-US">',
  '  <head>',
  '    <meta charset="utf-8">',
  '    <title>ERROR</title>',
  '  </head>',
  '  <body><main>',
  '    <h1>ERROR</h1>',
  '    <p>__msg__</p>'
];
const systemErrorPageStart = customErrorPageStart.concat(...[
  '    <p>Location:</p>',
  '    <pre>__stack__</pre>'
]);
const errorPageEnd = [
  '  </main></body>',
  '</html>',
  ''
];
const customErrorPage = customErrorPageStart.concat(...errorPageEnd);
const systemErrorPage = systemErrorPageStart.concat(...errorPageEnd);
// CSS selectors for targets of moves.
const moves = {
  text: 'input[type=text]',
  radio: 'input[type=radio]',
  checkbox: 'input[type=checkbox]',
  select: 'select',
  button: 'button',
  link: 'a',
  focus: true
};
// Names and descriptions of tests.
const tests = {
  autocom: 'list inputs with their autocomplete attributes',
  axe: 'conduct and report an Axe test',
  bodyText: 'give the text content of the page body',
  bulk: 'report the count of visible elements',
  focOl: 'tabulate and list focusable elements with and without focus outlines',
  focOp: 'tabulate and list visible focusable and operable elements',
  focOpAll: 'tabulate and list focusable and operable elements after making all visible',
  hover: 'tabulate and list hover-caused context additions',
  ibm: 'conduct and report an IBM test',
  imgAlt: 'list the values of the alt attributes of img elements',
  imgBg: 'show the background images and their related texts',
  imgDec: 'show the decorative images and their related texts',
  imgInf: 'show the informative images and their related texts',
  inLab: 'list the inputs and their labels',
  labClash: 'tabulate and describe inconsistencies in labeling',
  linkUl: 'tabulate and list underlined and other inline links',
  motion: 'report motion',
  radioSet: 'tabulate and list radio buttons in and not in accessible fieldsets',
  roleList: 'list elements having role attributes',
  roleS: 'tabulate elements with inaccessible roles',
  simple: 'perfunctory trivial test for testing',
  state: 'show an element with and without its focus and hover states in 3 browsers',
  styleDiff: 'tabulate and list style inconsistencies',
  wave: 'conduct and report a WAVE test'
};
// Browser types available in PlayWright.
const browserTypeNames = {
  'chromium': 'Chrome',
  'firefox': 'Firefox',
  'webkit': 'Safari'
};
// Items that may be waited for.
const waitables = ['url', 'title', 'body'];
// ########## VARIABLES
// Facts about the current browser.
let browserContext;
let browserTypeName;
// ########## FUNCTIONS
// Serves a redirection.
const redirect = (url, response) => {
  response.statusCode = 303;
  response.setHeader('Location', url);
  response.end();
};
// Launches a browser.
const launch = async typeName => {
  const browserType = require('playwright')[typeName];
  // If the specified browser type exists:
  if (browserType) {
    // Close any existing browser.
    let browser = browserContext && browserContext.browser();
    if (browser) {
      await browser.close();
    }
    // Launch it.
    const browserOptions = {};
    if (debug) {
      browserOptions.headless = false;
    }
    if (waits) {
      browserOptions.slowMo = waits;
    }
    browser = await browserType.launch(browserOptions);
    // Create a new context (window) in it.
    browserContext = await browser.newContext();
    // When a page is added to the browser context:
    browserContext.on('page', page => {
      // Make its console messages appear in the Playwright console.
      page.on('console', msg => console.log(msg.text()));
    });
    // Open the first page of the context.
    const page = await browserContext.newPage();
    // Wait until it is stable.
    await page.waitForLoadState('networkidle');
    // Update the name of the current browser type.
    browserTypeName = typeName;
  }
};
// Serves a system error message.
const serveError = (error, response) => {
  if (response.writableEnded) {
    console.log(error.message);
    console.log(error.stack);
  }
  else {
    response.statusCode = 400;
    response.write(
      systemErrorPage
      .join('\n')
      .replace('__msg__', error.message)
      .replace('__stack__', error.stack)
    );
    response.end();
  }
  return '';
};
// Serves a custom error message.
const serveMessage = (msg, response) => {
  if (response.writableEnded) {
    console.log(msg);
  }
  else {
    response.statusCode = 400;
    response.write(customErrorPage.join('\n').replace('__msg__', msg));
    response.end();
  }
  return '';
};
// Serves a page.
const servePage = (content, newURL, mimeType, response) => {
  response.setHeader('Content-Type', `${mimeType}; charset=UTF-8`);
  if (newURL) {
    response.setHeader('Content-Location', newURL);
  }
  response.end(content);
};
// Serves or returns part of all of an HTML or plain-text page.
const render = (path, stage, which, query, response) => {
  if (! response.writableEnded) {
    // If an HTML page is to be rendered:
    if (['all', 'raw'].includes(stage)) {
      // Get the page.
      return fs.readFile(`./${path}/${which}.html`, 'utf8')
      .then(
        // When it arrives:
        page => {
          // Replace its placeholders with eponymous query parameters.
          const renderedPage = page.replace(/__([a-zA-Z]+)__/g, (ph, qp) => query[qp]);
          // If the page is ready to serve in its entirety:
          if (stage === 'all') {
            // Serve it.
            servePage(renderedPage, `/${path}-out.html`, 'text/html', response);
            return '';
          }
          // Otherwise, i.e. if the page needs modification before it is served:
          else {
            return renderedPage;
          }
        },
        error => serveError(new Error(error), response)
      );
    }
    // Otherwise, if a plain-text page is ready to start:
    else if (stage === 'start') {
      // Serve its start.
      response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      // Set headers to tell the browser to render content chunks as they arrive.
      response.setHeader('Transfer-Encoding', 'chunked');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      if (path) {
        response.setHeader('Content-Location', `/${path}-out.txt`);
      }
      response.write(`Report timestamp: ${query.timeStamp}\n\nProcessed URL 0\n`);
      return '';
    }
    // Otherwise, if a plain-text page is ready to continue:
    else if (stage === 'more') {
      // Serve its continuation.
      response.write(`Processed URL ${query.urlIndex}\n`);
      return '';
    }
    // Otherwise, if a plain-text page is ready to end:
    else if (stage === 'end') {
      // Serve its end.
      response.end(`Processed URL ${query.urlIndex}\n`);
      return '';
    }
    else {
      serveError('ERROR: Invalid stage.', response);
    }
  }
};
// Returns the index of an element matching a text, among elements of a type.
const matchIndex = async (page, selector, text) => await page.$eval(
  'body',
  (body, args) => {
    const [selector, text] = args;
    // Identify the elements of the specified type.
    const matches = Array.from(body.querySelectorAll(selector));
    // If there are any:
    if (matches.length) {
      // Return the index of the first one satisfying the text condition, or -1 if none.
      return matches.findIndex(match =>
        match.textContent.includes(text)
        || (
          match.hasAttribute('aria-label')
          && match.getAttribute('aria-label').includes(text)
        )
        || (
          match.labels
          && Array
          .from(match.labels)
          .map(label => label.textContent)
          .join(' ')
          .includes(text)
        )
        || (
          match.hasAttribute('aria-labelledby')
          && match
          .getAttribute('aria-labelledby')
          .split(/\s+/)
          .map(id => document.getElementById(id).textContent)
          .join(' ')
          .includes(text)
        )
        || (
          match.hasAttribute('placeholder')
          && match.getAttribute('placeholder').includes(text)
        )
      );
    }
    // Otherwise, i.e. if there are no elements of the specified type:
    else {
      // Return this.
      return -1;
    }
  },
  [selector, text]
);
// Validates a browser type.
const isBrowserType = type => ['chromium', 'firefox', 'webkit'].includes(type);
// Validates a URL.
const isURL = string => /^(?:https?|file):\/\/[^ ]+$/.test(string);
// Validates a focusable tag name.
const isFocusable = string => ['a', 'button', 'input', 'select', 'option'].includes(string);
// Returns whether all elements of an array are strings.
const areStrings = array => array.every(element => typeof element === 'string');
// Returns whether a variable has a specified type.
const hasType = (variable, type) => {
  if (type === 'string') {
    return typeof variable === 'string';
  }
  else if (type === 'array') {
    return Array.isArray(variable);
  }
  else if (type === 'boolean') {
    return typeof variable === 'boolean';
  }
  else if (type === 'number') {
    return typeof variable === 'number';
  }
  else {
    return false;
  }
};
// Returns whether a variable has a specified subtype.
const hasSubtype = (variable, subtype) => {
  if (subtype) {
    if (subtype === 'hasLength') {
      return variable.length > 0;
    }
    else if (subtype === 'isURL') {
      return isURL(variable);
    }
    else if (subtype === 'isBrowserType') {
      return isBrowserType(variable);
    }
    else if (subtype === 'isFocusable') {
      return isFocusable(variable);
    }
    else if (subtype === 'isTest') {
      return tests[variable];
    }
    else if (subtype === 'isWaitable') {
      return waitables.includes(variable);
    }
    else if (subtype === 'areStrings') {
      return areStrings(variable);
    }
    else {
      return false;
    }
  }
  else {
    return true;
  }
};
// Validates a command.
const isValid = command => {
  // Identify the type of the command.
  const type = command.type;
  // If the type exists and is known:
  if (type && commands.etc[type]) {
    // Initialize the validators of the command.
    let validator = {};
    // If the type is test:
    if (type === 'test') {
      // Identify the test.
      const testName = command.which;
      // If it is known:
      if (testName && tests[testName]) {
        // Add its validator(s).
        validator = commands.etc.test[1];
        const extraVal = commands.tests[testName];
        if (extraVal) {
          Object.keys(extraVal[1]).forEach(key => {
            validator[key] = extraVal[1][key];
          });
        }
      }
    }
    // Otherwise, i.e. if the type is not test:
    else {
      // Add its validator.
      validator = commands.etc[type][1];
    }
    // Return whether the command is valid.
    return Object.keys(validator).every(property => {
      const vP = validator[property];
      const cP = command[property];
      // If it is optional and omitted or present and valid:
      return ! vP[0] && ! cP || cP !== undefined && hasType(cP, vP[1]) && hasSubtype(cP, vP[2]);
    });
  }
  // Otherwise, i.e. if the command has an unknown or no type:
  else {
    // Return failure.
    return false;
  }
};
// Visits a URL.
const visit = async (act, page) => {
  // Visit the URL and wait until it is stable.
  const resolved = act.which.replace('__dirname', __dirname);
  try {
    await page.goto(resolved, {
      timeout: 10000,
      waitUntil: 'load'
    });
    // Press the Esc key to dismiss any initial modal dialog.
    await page.keyboard.press('Escape');
    // Add the resulting URL to the act, if any.
    if (act) {
      act.result = page.url();
    }
  }
  catch (error) {
    await page.goto('about:blank');
    if (act) {
      act.result = `ERROR visiting ${resolved}: ${error.message}`;
    }
    else {
      console.log(`ERROR visiting ${resolved}`);
    }
  }
};
// Recursively performs the commands in a report.
const doActs = async (report, actIndex, page, timeStamp, reportDir) => {
  // Identify the commands in the report.
  const {acts} = report;
  // If any commands remain unperformed:
  if (actIndex < acts.length) {
    // Identify the command to be performed.
    const act = acts[actIndex];
    // If it is valid:
    if (isValid(act)) {
      // If the command is a launch:
      if (act.type === 'launch') {
        // Launch the specified browser, creating a browser context and a page in it.
        await launch(act.which);
        // Identify its only page as current.
        page = browserContext.pages()[0];
      }
      // Otherwise, if a current page exists:
      else if (page) {
        // If the command is a url:
        if (act.type === 'url') {
          // Visit it and wait until it is stable.
          await visit(act, page);
        }
        // Otherwise, if the act is a wait:
        else if (act.type === 'wait') {
          // Wait for the specified text to appear in the specified place.
          await page.waitForFunction(act => {
            const {URL, title, body} = document;
            const success = {
              url: body && URL && URL.includes(act.which),
              title: body && title && title.includes(act.which),
              body: body && body.textContent && body.textContent.includes(act.which)
            };
            return success[act.what];
          }, act, {timeout: 20000});
          // Add the resulting URL to the act.
          act.result = page.url();
        }
        // Otherwise, if the act is a page switch:
        else if (act.type === 'page') {
          // Wait for a page to be created and identify it as current.
          page = await browserContext.waitForEvent('page');
          // Wait until it is stable and thus ready for the next act.
          await page.waitForLoadState('networkidle', {timeout: 20000});
          // Add the resulting URL and any description of it to the act.
          const result = {
            url: page.url()
          };
          act.result = result;
        }
        // Otherwise, if the page has a URL:
        else if (page.url() && page.url() !== 'about:blank') {
          const url = page.url();
          // Add the URL to the act.
          act.url = url;
          // If the act is a revelation:
          if (act.type === 'reveal') {
            // Make all elements in the page visible.
            await page.$$eval('body *', elements => {
              elements.forEach(el => {
                const elStyleDec = window.getComputedStyle(el);
                if (elStyleDec.display === 'none') {
                  el.style.display = 'initial';
                }
                if (['hidden', 'collapse'].includes(elStyleDec.visibility)) {
                  el.style.visibility = 'inherit';
                }
              });
            });
            act.result = 'All elements visible.';
          }
          // Otherwise, if the act is a test:
          else if (act.type === 'test') {
            // Add a description of the test to the act.
            act.what = tests[act.which];
            // Initialize the arguments.
            const args = [page];
            // Identify the additional validator of the test.
            const testValidator = commands.tests[act.which];
            // If it exists:
            if (testValidator) {
              // Identify its argument properties.
              const argProperties = Object.keys(testValidator[1]);
              // Add their values to the arguments.
              args.push(...argProperties.map(propName => act[propName]));
            }
            // Conduct and report the test.
            const testReport = await require(`./tests/${act.which}`).reporter(...args);
            // If the test produced exhibits:
            if (testReport.exhibits) {
              // Add that fact to the act.
              act.exhibits = 'appended';
              // Replace any browser-type placeholder in the exhibits.
              const newExhibits = testReport.exhibits.replace(
                /__browserTypeName__/g, browserTypeNames[browserTypeName]
              );
              // Append the exhibits to any existing ones.
              if (report.exhibits) {
                report.exhibits += `\n${newExhibits}`;
              }
              else {
                report.exhibits = newExhibits;
              }
            }
            // Add the result object (possibly an array) to the act.
            const resultCount = Object.keys(testReport.result).length;
            act.result = resultCount ? testReport.result : 'NONE';
          }
          // Otherwise, if the act is a move:
          else if (moves[act.type]) {
            const selector = typeof moves[act.type] === 'string' ? moves[act.type] : act.what;
            // Identify the index of the specified element among same-type elements.
            const whichIndex = await matchIndex(page, selector, act.which);
            // If it exists:
            if (whichIndex > -1) {
              // Get its ElementHandle.
              const whichElement = await page.$(`:nth-match(${selector}, ${whichIndex + 1})`);
              // Focus it.
              await whichElement.focus();
              // Perform the act on the element and add a move description to the act.
              if (act.type === 'focus') {
                act.result = 'focused';
              }
              else if (act.type === 'text') {
                await whichElement.type(act.what);
                act.result = 'entered';
              }
              else if (['radio', 'checkbox'].includes(act.type)) {
                await whichElement.check();
                act.result = 'checked';
              }
              else if (act.type === 'select') {
                await whichElement.selectOption({what: act.what});
                const optionText = await whichElement.$eval(
                  'option:selected', el => el.textContent
                );
                act.result = optionText
                  ? `&ldquo;${optionText}}&rdquo; selected`
                  : 'OPTION NOT FOUND';
              }
              else if (act.type === 'button') {
                await whichElement.click();
                act.result = 'clicked';
              }
              else if (act.type === 'link') {
                const href = await whichElement.getAttribute('href');
                const target = await whichElement.getAttribute('target');
                await whichElement.click();
                act.result = {
                  href: href || 'NONE',
                  target: target || 'NONE',
                  move: 'clicked'
                };
              }
              // Otherwise, i.e. if the specified element was not identified:
              else {
                // Return an error result.
                return 'NOT FOUND';
              }
            }
          }
          // Otherwise, i.e. if the act type is unknown:
          else {
            // Add the error result to the act.
            act.result = 'INVALID COMMAND TYPE';
          }
        }
        // Otherwise, i.e. if the required page URL does not exist:
        else {
          // Add an error result to the act.
          act.result = 'PAGE HAS NO URL';
        }
      }
      // Otherwise, i.e. if no page exists:
      else {
        // Add an error result to the act.
        act.result = 'NO PAGE IDENTIFIED';
      }
    }
    // Otherwise, i.e. if the command is invalid:
    else {
      // Add an error result to the act.
      act.result = `INVALID COMMAND OF TYPE ${act.type}`;
    }
    // Update the report file.
    fs.writeFile(`${reportDir}/report-${timeStamp}.json`, JSON.stringify(report, null, 2));
    // Perform the remaining acts.
    await doActs(report, actIndex + 1, page, timeStamp, reportDir);
  }
  // Otherwise, i.e. if all acts have been performed:
  else {
    // Return a Promise.
    return Promise.resolve('');
  }
};
// Handles a script request.
const scriptHandler = async (
  what, acts, query, stage, urlIndex, response
) => {
  const report = {};
  report.script = query.scriptName;
  report.batch = query.batchName;
  report.what = what;
  report.timeStamp = query.timeStamp;
  report.acts = acts;
  const urlSuffix = urlIndex > -1 ? `-${urlIndex.toString().padStart(3, '0')}` : '';
  // Perform the specified acts and add the results and exhibits to the report.
  await doActs(report, 0, null, `${query.timeStamp}${urlSuffix}`, query.reportDir);
  // If any exhibits have been added to the report, move them to the query.
  if (report.exhibits) {
    query.exhibits = report.exhibits;
    delete report.exhibits;
  }
  // Otherwise, i.e. if no exhibits have been added to the report:
  else {
    // Add properties to the query.
    query.exhibits = '<p><strong>None</strong></p>';
    query.urlIndex = urlIndex;
  }
  // Convert the report to JSON.
  query.report = JSON.stringify(report, null, 2).replace(/</g, '&lt;');
  // Render and serve the output.
  render('', stage, 'out', query, response);
};
// Recursively gets an array of file-name base/property-value arrays from JSON object files.
const getWhats = async (path, baseNames, result) => {
  if (baseNames.length) {
    const firstName = baseNames[0];
    const content = await fs.readFile(`${path}/${firstName}.json`, 'utf8');
    const addition = [firstName, JSON.parse(content).what];
    result.push(addition);
    return await getWhats(path, baseNames.slice(1), result);
  }
  else {
    return Promise.resolve(result);
  }
};
// Handles a request.
const requestHandler = (request, response) => {
  const {method} = request;
  const bodyParts = [];
  request.on('error', err => {
    console.error(err);
  })
  .on('data', chunk => {
    bodyParts.push(chunk);
  })
  // When the request has arrived:
  .on('end', async () => {
    // Identify its WHATWG URL instance.
    let url = new URL(request.url, `${protocol}://${request.headers.host}`);
    // Identify the pathname, with any initial 'autotest/' segment deleted.
    let pathName = url.pathname;
    if (pathName.startsWith('/autotest/')) {
      pathName = pathName.slice(9);
    }
    else if (pathName === '/autotest') {
      pathName = '/';
    }
    const query = {};
    // If the request method is GET:
    if (method === 'GET') {
      // Identify a query object, presupposing no query name occurs twice.
      const searchParams = url.searchParams;
      searchParams.forEach((value, name) => {
        query[name] = value;
      });
      let type = statics[pathName];
      let encoding;
      if (type) {
        encoding = 'utf8';
      }
      else if (pathName.endsWith('.png')) {
        type = 'image/png';
        encoding = null;
      }
      const target = redirects[pathName];
      // If a requestable static file is requested:
      if (type) {
        // Get the file content.
        const content = await fs.readFile(pathName.slice(1), encoding);
        // When it has arrived, serve it.
        servePage(content, pathName, type, response);
      }
      // Otherwise, if the request must be redirected:
      else if (target) {
        // Redirect it.
        redirect(target, response);
      }
      // Otherwise, if the site icon was requested:
      else if (pathName === '/favicon.ico') {
        // Get the file content.
        const content = await fs.readFile('favicon.png');
        // When it has arrived, serve it.
        response.setHeader('Content-Type', 'image/png');
        response.write(content, 'binary');
        response.end();
      }
      // Otherwise, if the initial page was requested:
      else if (pathName === '/' || pathName === '/index.html') {
        // Add properties to the query.
        query.scriptDir = process.env.SCRIPTDIR || '';
        query.batchDir = process.env.BATCHDIR || '';
        query.reportDir = process.env.REPORTDIR || '';
        // Render the page.
        render('', 'all', 'index', query, response);
      }
      // Otherwise, i.e. if the URL is invalid:
      else {
        serveMessage('ERROR: Invalid URL.', response);
      }
    }
    // Otherwise, if the request method is POST:
    else if (method === 'POST') {
      // Get a query string from the request body.
      const queryString = Buffer.concat(bodyParts).toString();
      // Create a query object.
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, name) => {
        query[name] = value;
      });
      // Add a timeStamp for any required report file to the query.
      query.timeStamp = Math.floor((Date.now() - Date.UTC(2021, 4)) / 10000).toString(36);
      // If the request submitted the directory form:
      if (pathName === '/where' && query.scriptDir && query.batchDir && query.reportDir) {
        const {scriptDir, batchDir} = query;
        // Request an array of the names of the files in the script directory.
        const scriptFileNames = await fs.readdir(scriptDir);
        // When the array arrives, get an array of script names from it.
        const scriptNames = scriptFileNames
        .filter(name => name.endsWith('.json'))
        .map(name => name.slice(0, -5));
        // If any exist:
        if (scriptNames.length) {
          // Add their count to the query.
          query.scriptSize = scriptNames.length;
          // Get their descriptions.
          const scriptWhats = await getWhats(scriptDir, scriptNames, []);
          // When the descriptions arrive, add them as options to the query.
          query.scriptNames = scriptWhats.map((pair, index) => {
            const state = index === 0 ? 'selected ' : '';
            return `<option ${state}value="${pair[0]}">${pair[0]}: ${pair[1]}</option>`;
          }).join('\n              ');
          // Request an array of the names of the files in the batch directory.
          const batchFileNames = await fs.readdir(batchDir);
          // When the array arrives, get an array of batch names from it.
          const batchNames = batchFileNames
          .filter(name => name.endsWith('.json'))
          .map(name => name.slice(0, -5));
          // Get their descriptions.
          const batchWhats = await getWhats(batchDir, batchNames, []);
          // Prepend a no-batch option to the name/description array.
          batchWhats.unshift(['None', 'Perform the script without a batch']);
          // Add the count of batches to the query.
          query.batchSize = batchWhats.length;
          // Add the batch names and descriptions as options to the query.
          query.batchNames = batchWhats.map((pair, index) => {
            const state = index === 0 ? 'selected ' : '';
            return `<option ${state}value="${pair[0]}">${pair[0]}: ${pair[1]}</option>`;
          }).join('\n              ');
          // Render the choice page.
          render('', 'all', 'which', query, response);
        }
        // Otherwise, i.e. if no scripts exist in the script directory:
        else {
          // Serve an error message.
          serveMessage(`ERROR: No scripts in ${scriptDir}.`, response);
        }
      }
      // Otherwise, if the request submitted the choice form:
      else if (
        pathName === '/which'
        && query.scriptDir
        && query.batchDir
        && query.reportDir
        && query.scriptName
        && query.batchName
      ) {
        const {scriptDir, batchDir, scriptName, batchName} = query;
        // Get the content of the script.
        const scriptJSON = await fs.readFile(`${scriptDir}/${scriptName}.json`, 'utf8');
        // When the content arrives, if there is any:
        if (scriptJSON) {
          // Get the script data.
          const script = JSON.parse(scriptJSON);
          const {what, acts} = script;
          // If the script is valid:
          if (
            what
            && acts
            && typeof what === 'string'
            && Array.isArray(acts)
            && acts[0].type === 'launch'
            && acts.length > 1
            && acts[1].type === 'url'
            && isURL(acts[1].which)
          ) {
            // If there is no batch:
            if (batchName === 'None') {
              // Process the script.
              scriptHandler(what, acts, query, 'all', -1, response);
            }
            // Otherwise, i.e. if there is a batch:
            else {
              // Get its content.
              const batchJSON = await fs.readFile(`${batchDir}/${batchName}.json`, 'utf8');
              // When the content arrives, if there is any:
              if (batchJSON) {
                // Get the batch data.
                const batch = JSON.parse(batchJSON);
                const batchWhat = batch.what;
                const {hosts} = batch;
                // If the batch is valid:
                if (
                  batchWhat
                  && hosts
                  && typeof batchWhat === 'string'
                  && Array.isArray(hosts)
                  && hosts.every(host => host.which && host.what && isURL(host.which))
                ) {
                  // FUNCTION DEFINITION START
                  // Recursively process commands on the hosts of a batch.
                  const doBatch = async (hosts, isFirst, hostIndex) => {
                    if (hosts.length) {
                      // Identify the first host.
                      const firstHost = hosts[0];
                      console.log(`Batch progress: about to process ${firstHost.what}`);
                      // Replace all hosts in the script with it.
                      acts.forEach(act => {
                        if (act.type === 'url') {
                          act.which = firstHost.which;
                          act.what = firstHost.what;
                        }
                      });
                      // Process the commands on it.
                      let stage = 'more';
                      if (isFirst) {
                        stage = hosts.length > 1 ? 'start' : 'all';
                      }
                      else {
                        stage = hosts.length > 1 ? 'more' : 'end';
                      }
                      await scriptHandler(what, acts, query, stage, hostIndex, response);
                      // Process the remaining hosts.
                      await doBatch(hosts.slice(1), false, hostIndex + 1);
                    }
                  };
                  // FUNCTION DEFINITION END
                  // Process the script on the batch.
                  doBatch(hosts, true, 0);
                }
                // Otherwise, i.e. if the batch is invalid:
                else {
                  // Serve an error message.
                  serveMessage(`ERROR: Batch ${batchName} invalid.`, response);
                }
              }
              // Otherwise, i.e. if the batch has no content:
              else {
                // Serve an error message.
                serveMessage(`ERROR: Batch ${batchName} empty.`, response);
              }
            }
          }
          // Otherwise, i.e. if the script is invalid:
          else {
            // Serve an error message.
            serveMessage(`ERROR: Script ${scriptName} invalid.`, response);
          }
        }
        // Otherwise, i.e. if the script has no content:
        else {
          // Serve an error message.
          serveMessage(`ERROR: Script ${scriptName} empty`, response);
        }
      }
      // Otherwise, i.e. if the request is invalid:
      else {
        // Serve an error message.
        serveMessage('ERROR: Form submission invalid.', response);
      }
    }
  });
};
// ########## SERVER
const serve = (protocolModule, options) => {
  const server = protocolModule.createServer(options, requestHandler);
  const port = process.env.PORT || '3000';
  server.listen(port, () => {
    console.log(`Server listening at ${protocol}://localhost:${port}.`);
  });
};
if (protocol === 'http') {
  serve(http, {});
}
else if (protocol === 'https') {
  fs.readFile(process.env.KEY)
  .then(
    key => {
      fs.readFile(process.env.CERT)
      .then(
        cert => {
          serve(https, {key, cert});
        },
        error => console.log(error.message)
      );
    },
    error => console.log(error.message)
  );
}
