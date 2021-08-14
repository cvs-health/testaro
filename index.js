/*
  index.js
  autotest main script.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// Module to keep secrets local.
require('dotenv').config();
// Module to create an HTTP server and client.
const http = require('http');
// Module to create an HTTPS server and client.
const https = require('https');
const {injectAxe, getViolations} = require('axe-playwright');
const {commands} = require('./commands');
// ########## CONSTANTS
// Set debug to true to add debugging features.
const debug = false;
const protocol = process.env.PROTOCOL || 'https';
// Files servable without modification.
const statics = {
  '/style.css': 'text/css'
};
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
// CSS selectors for actions.
const moves = {
  text: 'input[type=text]',
  radio: 'input[type=radio]',
  checkbox: 'input[type=checkbox]',
  select: 'select',
  button: 'button',
  link: 'a',
  focus: true
};
const tests = {
  autocom: 'list inputs with their autocomplete attributes',
  bodyText: 'give the text content of the page body',
  bulk: 'report the count of visible elements',
  combo: 'report results and a score from multiple tests',
  focOl: 'tabulate and list focusable elements with and without focus outlines',
  focOlS: 'tabulate focusable elements with and without focus outlines',
  focOp: 'tabulate and list visible focusable and operable elements',
  focOpAll: 'tabulate and list focusable and operable elements after making all visible',
  focOpAllS: 'tabulate focusable and operable elements after making all visible',
  focOpS: 'tabulate visible focusable and operable elements',
  imgAlt: 'list the values of the alt attributes of img elements',
  imgBg: 'show the background images and their related texts',
  imgDec: 'show the decorative images and their related texts',
  imgInf: 'show the informative images and their related texts',
  inLab: 'list the inputs and their labels',
  labClash: 'tabulate and describe inconsistencies in labeling',
  labClashS: 'tabulate inconsistencies in labeling',
  linkUl: 'tabulate and list underlined and other inline links',
  linkUlS: 'tabulate inline links and how many are underlined',
  radioSet: 'tabulate and list radio buttons in and not in accessible fieldsets',
  radioSetS: 'tabulate radio buttons in and not in accessible fieldsets',
  roleList: 'list elements having role attributes',
  roleListS: 'tabulate element tag names and roles assigned to them',
  roleS: 'tabulate elements with inaccessible roles',
  simple: 'perfunctory trivial test for testing',
  state: 'show an element with and without its focus and hover states in 3 browsers',
  styleDiff: 'tabulate and list style inconsistencies',
  styleDiffS: 'tabulate style inconsistencies'
};
const browserTypeNames = {
  'chromium': 'Chrome',
  'firefox': 'Firefox',
  'webkit': 'Safari'
};
const waitables = ['url', 'title', 'body'];
// ########## VARIABLES
let browserContext;
let browserTypeName;
// ########## FUNCTIONS
// Serves a redirection.
const redirect = (url, response) => {
  response.statusCode = 303;
  response.setHeader('Location', url);
  response.end();
};
// Conducts an axe test.
const axe = async (page, withItems, rules = []) => {
  // Inject axe-core into the page.
  await injectAxe(page);
  // Initialize the report.
  const report = {
    warnings: 0,
    violations: {
      minor: 0,
      moderate: 0,
      serious: 0,
      critical: 0
    }
  };
  if (withItems) {
    report.items = [];
  }
  // Get the data on the elements violating the specified axe-core rules.
  const axeOptions = {};
  if (rules.length) {
    axeOptions.runOnly = rules;
  }
  const axeReport = await getViolations(page, null, {axeOptions});
  // If there are any such elements:
  if (axeReport.length) {
    // FUNCTION DEFINITIONS START
    // Compacts a check violation.
    const compactCheck = checkObj => {
      return {
        check: checkObj.id,
        description: checkObj.message,
        impact: checkObj.impact
      };
    };
    // Compacts a violating element.
    const compactViolator = elObj => {
      const out = {
        selector: elObj.target[0],
        impact: elObj.impact
      };
      if (elObj.any && elObj.any.length) {
        out['must pass any of'] = elObj.any.map(checkObj => compactCheck(checkObj));
      }
      if (elObj.none && elObj.none.length) {
        out['must pass all of'] = elObj.none.map(checkObj => compactCheck(checkObj));
      }
      return out;
    };
    // Compacts a violated rule.
    const compactRule = rule => {
      const out = {
        rule: rule.id,
        description: rule.description,
        impact: rule.impact,
        elements: {}
      };
      if (rule.nodes && rule.nodes.length) {
        out.elements = rule.nodes.map(el => compactViolator(el));
      }
      return out;
    };
    // FUNCTION DEFINITIONS END
    // For each rule violated:
    axeReport.forEach(rule => {
      // For each element violating the rule:
      rule.nodes.forEach(element => {
        // Increment the element count of the impact of its violation.
        report.violations[element.impact]++;
      });
      // If details are required:
      if (withItems) {
        // Add it to the report.
        report.items.push(compactRule(rule));
      }
    });
    // Return the report.
    return report;
  }
  // Otherwise, i.e. if there are no violations:
  else {
    // Return a success report.
    return 'O.K.';
  }
};
// Conducts a WAVE test and returns a Promise of a result.
const wave1 = url => {
  const waveKey = process.env.WAVE_KEY;
  // Get the data from a WAVE test.
  return new Promise(resolve => {
    https.get(
      {
        host: 'wave.webaim.org',
        path: `/api/request?key=${waveKey}&url=${url}`,
        protocol: 'https:'
      },
      response => {
        let report = '';
        response.on('data', chunk => {
          report += chunk;
        });
        // When the data arrive, return them as an object.
        response.on('end', () => {
          try {
            return resolve(JSON.parse(report));
          }
          catch (error) {
            return resolve({
              error: 'WAVE did not return JSON.',
              report
            });
          }
        });
      }
    );
  });
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
    browser = await browserType.launch(debug ? {headless: false, slowMo: 1000} : {});
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
// Serves the start of a page.
const startPage = (content, newURL, mimeType, response) => {
  response.setHeader('Content-Type', `${mimeType}; charset=UTF-8`);
  // Set headers to tell the browser to render content chunks as they arrive.
  response.setHeader('Transfer-Encoding', 'chunked');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (newURL) {
    response.setHeader('Content-Location', newURL);
  }
  response.write(content);
};
// Serves an increment of a page.
const morePage = (content, response) => {
  response.write(content);
};
// Serves an increment of a page.
const endPage = (content, response) => {
  response.end(`${content}\nDone\n`);
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
      // Serve it.
      startPage(
        `Report timestamp: ${query.timeStamp}\n\nProcessed URL 0\n`,
        `/${path}-out.txt`,
        'text/plain',
        response
      );
      return '';
    }
    // Otherwise, if a plain-text page is ready to continue:
    else if (stage === 'more') {
      // Serve it.
      morePage(`Processed URL ${query.urlIndex}\n`, response);
      return '';
    }
    // Otherwise, if a plain-text page is ready to end:
    else if (stage === 'end') {
      // Serve it.
      endPage(`Processed URL ${query.urlIndex}\n`, response);
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
const isTagName = string => ['a', 'button', 'input', 'select', 'option'].includes(string);
// Returns whether a variable has a specified type.
const areStrings = array => array.every(element => typeof element === 'string');
// Returns whether a variable has a specified type.
const hasType = (variable, type) => {
  if (type === 'string') {
    return typeof variable === 'string';
  }
  else if (type === 'array') {
    return Array.isArray(variable);
  }
  else {
    return false;
  }
};
// Returns whether a variable has a specified type.
const hasSubtype = (variable, subtype) => {
  if (subtype === 'hasLength') {
    return variable.length > 0;
  }
  else if (subtype === 'isURL') {
    return isURL(variable);
  }
  else if (subtype === 'isBrowserType') {
    return isBrowserType(variable);
  }
  else if (subtype === 'isTagName') {
    return isTagName(variable);
  }
  else if (subtype === 'isCustomTest') {
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
};
// Validates a command.
const isValid = command => {
  // If the command has a known type:
  if (command.type && commands[command.type]) {
    // Identify the validation specifications of that type.
    const validator = commands[command.type][1];
    // If the specifications permit or require a which property:
    if (validator.which) {
      // If the command has a which property:
      if (command.which) {
        // If its value has the required type:
        if (hasType(command.which, validator.which[1])) {
          // If its value has the required subtype:
          if (hasSubtype(command.which, validator.which[2])) {
            // If the specifications permit or require a what property:
            if (validator.what) {
              // If the command has a what property:
              if (command.what) {
                // If its value has the required type:
                if (hasType(command.what, validator.what[1])) {
                  // Return whether its value has the required subtype:
                  return hasSubtype(command.what, validator.what[2]);
                }
                // Otherwise, i.e. if its value does not have the required type:
                else {
                  // Return failure.
                  return false;
                }
              }
              // Otherwise, i.e. if the command does not have a what property:
              else {
                // Return whether a what property is optional.
                return ! validator.what[0];
              }
            }
            // Otherwise, i.e. if the specifications prohibit a what property:
            else {
              // Return whether the command has no what property.
              return ! command.what;
            }
          }
          // Otherwise, i.e. if the which value does not have the required subtype:
          else {
            // Return failure.
            return false;
          }
        }
        // Otherwise, i.e. if the which value does not have the required type:
        else {
          // Return failure.
          return false;
        }
      }
      // Otherwise, i.e. if the command has no which property:
      else {
        // Return whether a which property is optional.
        return ! validator.which[0];
      }
    }
    // Otherwise, i.e. if the specifications prohibit a which property:
    else {
      // Return whether the command has no which property.
      return ! command.which;
    }
  }
  // Otherwise, i.e. if the command has an unknown or no type:
  else {
    // Return failure.
    return false;
  }
};
// Recursively performs the acts commanded in a report.
const doActs = async (report, actIndex, page, timeStamp, reportDir) => {
  // Identify the acts in the report. Their initial values are commands.
  const {acts} = report;
  // If any commands remain unperformed:
  if (actIndex < acts.length) {
    // Identify the acts to be performed.
    const act = acts[actIndex];
    // If the command is valid:
    if (isValid(act)) {
      // Identify the command properties.
      const {type, which, what} = act;
      // If the command is a launch:
      if (type === 'launch') {
        // Launch the specified browser, creating a browser context and a page in it.
        await launch(which);
        // Identify its only page as current.
        page = browserContext.pages()[0];
      }
      // Otherwise, if a current page exists:
      else if (page) {
        // If the command is a url:
        if (type === 'url') {
          // Visit it and wait until it is stable.
          const resolved = which.replace('__dirname', __dirname);
          try {
            await page.goto(resolved, {
              timeout: 10000,
              waitUntil: 'load'
            });
            // Press the Esc key to dismiss any initial modal dialog.
            await page.keyboard.press('Escape');
            // Add the resulting URL to the act.
            act.result = page.url();
          }
          catch (error) {
            await page.goto('about:blank');
            act.result = `ERROR visiting ${resolved}: ${error.message}`;
          }
        }
        // Otherwise, if the act is a wait:
        else if (type === 'wait') {
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
        else if (type === 'page') {
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
        // Otherwise, if the act is a valid WAVE type-1 test:
        else if (type === 'wave1') {
          // Conduct a WAVE test and add the result to the act.
          act.result = await wave1(which || page.url());
        }
        // Otherwise, if the page has a URL:
        else if (page.url() && page.url() !== 'about:blank') {
          const url = page.url();
          // Add the URL to the act.
          act.url = url;
          // If the act is a revelation:
          if (type === 'reveal') {
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
          // If the act is a custom test:
          else if (type === 'test') {
            // Conduct it.
            const testReport = await require(`./tests/${which}/app`).reporter(page);
            // Add a description of the test to the act.
            act.what = tests[which];
            // If the test produced exhibits:
            if (testReport.exhibits) {
              // Add that fact to the act.
              act.exhibits = 'appended';
              // Replace any browser-type placeholder in the exhibits.
              const newExhibits = testReport.exhibits.replace(
                /__browserTypeName__/g, browserTypeNames[browserTypeName]
              );
              // Append the exhibits to the exhibits in the report.
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
          // Otherwise, if the act is an axe test:
          else if (type === 'axe') {
            // Conduct it and add its result to the act.
            act.result = await axe(page, which);
          }
          // Otherwise, if the act is an axe summary:
          else if (type === 'axeS') {
            // Conduct it and add its result to the act.
            act.result = await axe(page, false, []);
          }
          // Otherwise, if the act is a combination of tests:
          else if (type === 'combo') {
            act.result = {
              what: 'combination of tests'
            };
            // Recursively conducts an array of tests.
            const doCombo = async testNames => {
              if (testNames.length) {
                const firstTest = testNames[0];
                if (firstTest === 'axe') {
                  act.result.axe = await axe(page, true, []);
                }
                else if (firstTest === 'axeS') {
                  act.result.axeS = await axe(page, false, []);
                }
                else if (firstTest === 'wave1') {
                  act.result.wave1 = await wave1(page.url());
                }
                else if (tests[firstTest]) {
                  act.result[firstTest] = await require(`./tests/${firstTest}/app`).reporter(page);
                }
                else {
                  act.result[firstTest] = 'NO SUCH TEST';
                }
                await doCombo(testNames.slice(1));
                return Promise.resolve(1);
              }
              else {
                return Promise.resolve(1);
              }
            };
            // Conduct the specified combination of tests.
            await doCombo(which.slice(1));
            // If it includes at least 1 test and a reducer is specified:
            if (which.length > 1 && which[0].length) {
              // Perform the reduction and add its result to the act.
              const reducer = require(`./procs/test/${which[0]}`);
              try {
                if (reducer) {
                  act.result.deficit = reducer.reduce(act.result);
                }
              }
              catch (error) {
                act.result = `ERROR performing ${which[0]} proc: ${error.message}`;
              }
            }
          }
          // Otherwise, if the act targets a text-identified element:
          else if (moves[type]) {
            const selector = typeof moves[type] === 'string' ? moves[type] : act.what;
            // Identify the index of the specified element among same-type elements.
            const whichIndex = await matchIndex(page, selector, which);
            // If it exists:
            if (whichIndex > -1) {
              // Get its ElementHandle.
              const whichElement = await page.$(`:nth-match(${selector}, ${whichIndex + 1})`);
              // Focus it.
              await whichElement.focus();
              // Perform the act on the element and add a move description to the act.
              if (type === 'focus') {
                act.result = 'focused';
              }
              else if (type === 'text') {
                await whichElement.type(what);
                act.result = 'entered';
              }
              else if (['radio', 'checkbox'].includes(type)) {
                await whichElement.check();
                act.result = 'checked';
              }
              else if (type === 'select') {
                await whichElement.selectOption({what});
                const optionText = await whichElement.$eval(
                  'option:selected', el => el.textContent
                );
                act.result = optionText
                  ? `&ldquo;${optionText}}&rdquo; selected`
                  : 'OPTION NOT FOUND';
              }
              else if (type === 'button') {
                await whichElement.click();
                act.result = 'clicked';
              }
              else if (type === 'link') {
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
  isScript, scriptName, what, acts, query, stage, urlIndex, response
) => {
  const report = {};
  if (isScript) {
    report.script = scriptName;
  }
  else {
    report.commands = scriptName;
    report.batch = query.batchName;
  }
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
// Recursively gets an object of file-name bases and property values from JSON object files.
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
      // Otherwise, if the initial form was requested:
      else if (pathName === '/' || pathName === '/index.html') {
        // Render it.
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
      // If the path and the request specify an operation type:
      if (pathName === '/opType' && ['script', 'batch'].includes(query.opType)) {
        const {opType} = query;
        // If it is script:
        if (opType === 'script') {
          // Add properties to the query.
          query.scriptDir = process.env.SCRIPTDIR || '';
          query.reportDir = process.env.SCRIPTREPORTDIR || '';
          // Render the script-directories page.
          render('', 'all', 'scriptDirs', query, response);
        }
        // Otherwise, i.e. if it is batch:
        else {
          // Add properties to the query.
          query.batchDir = process.env.BATCHDIR || '';
          query.batchCmdDir = process.env.BATCHCMDDIR || '';
          query.reportDir = process.env.BATCHREPORTDIR || '';
          // Render the batch-directories page.
          render('', 'all', 'batchDirs', query, response);
        }
      }
      // Otherwise, if the path and the request specify script directories:
      else if (pathName === '/scriptDirs' && query.scriptDir && query.reportDir) {
        const {scriptDir} = query;
        // Request an array of the names of the files in the script directory.
        const fileNames = await fs.readdir(scriptDir);
        // When the array arrives, get an array of script names from it.
        const scriptNames = fileNames
        .filter(name => name.endsWith('.json'))
        .map(name => name.slice(0, -5));
        // If any exist:
        if (scriptNames.length) {
          // Add their count to the query.
          query.scriptSize = scriptNames.length;
          // Get their descriptions.
          const nameWhats = await getWhats(scriptDir, scriptNames, []);
          // When the descriptions arrive, add them as options to the query.
          query.scriptNames = nameWhats.map((pair, index) => {
            const state = index === 0 ? 'selected ' : '';
            return `<option ${state}value="${pair[0]}">${pair[0]}: ${pair[1]}</option>`;
          }).join('\n              ');
          // Render the script-selection page.
          render('', 'all', 'script', query, response);
        }
        // Otherwise, i.e. if no scripts exist in the specified directory:
        else {
          // Serve an error message.
          serveMessage(`ERROR: No scripts in ${scriptDir}.`, response);
        }
      }
      // Otherwise, if the path and the request specify batch directories:
      else if (
        pathName === '/batchDirs' && query.batchDir && query.batchCmdDir && query.reportDir
      ) {
        const {batchDir, batchCmdDir} = query;
        // Request an array of the names of the files in the batch directory.
        const fileNames = await fs.readdir(batchDir);
        // When the array arrives, get an array of batch names from it.
        const batchNames = fileNames
        .filter(name => name.endsWith('.json'))
        .map(name => name.slice(0, -5));
        // If any exist:
        if (batchNames.length) {
          // Add their count to the query.
          query.batchSize = batchNames.length;
          // Get their descriptions.
          const nameWhats = await getWhats(batchDir, batchNames, []);
          // When the descriptions arrive, add them as options to the query.
          query.batchNames = nameWhats.map((pair, index) => {
            const state = index === 0 ? 'selected ' : '';
            return `<option ${state}value="${pair[0]}">${pair[0]}: ${pair[1]}</option>`;
          }).join('\n              ');
          // Request an array of the names of the files in the command directory.
          const fileNames = await fs.readdir(batchCmdDir);
          // When the array arrives, get an array of command-list names from it.
          const batchCmdNames = fileNames
          .filter(name => name.endsWith('.json'))
          .map(name => name.slice(0, -5));
          // If any exist:
          if (batchCmdNames.length) {
            // Add their count to the query.
            query.batchCmdSize = batchCmdNames.length;
            // Get their descriptions.
            const nameWhats = await getWhats(batchCmdDir, batchCmdNames, []);
            // When the descriptions arrive, add them as options to the query.
            query.batchCmdNames = nameWhats.map((pair, index) => {
              const state = index === 0 ? 'selected ' : '';
              return `<option ${state}value="${pair[0]}">${pair[0]}: ${pair[1]}</option>`;
            }).join('\n              ');
            // Render the batch-selection page.
            render('', 'all', 'batch', query, response);
          }
          // Otherwise, i.e. if no command lists exist in the specified directory:
          else {
            // Serve an error message.
            serveMessage(`ERROR: No command files in ${batchCmdDir}.`, response);
          }
        }
        // Otherwise, i.e. if no batches exist in the specified directory:
        else {
          // Serve an error message.
          serveMessage(`ERROR: No batches in ${batchDir}.`, response);
        }
      }
      // Otherwise, if the path and the request specify a script:
      else if (
        pathName === '/scriptName' && query.scriptDir && query.reportDir && query.scriptName
      ) {
        const {scriptDir, scriptName} = query;
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
            && (
              acts[1].type === 'url'
              || (acts[1].type === 'wave1' && isURL(acts[1].which))
            )
          ) {
            // Process it.
            scriptHandler(true, scriptName, what, acts, query, 'all', -1, response);
          }
          // Otherwise, i.e. if the script is invalid:
          else {
            // Serve an error message.
            serveMessage(`ERROR: Script ${scriptName} invalid.`, response);
          }
        }
        // Otherwise, i.e. if there is no content:
        else {
          // Serve an error message.
          serveMessage(
            `ERROR: No script found in ${scriptDir}/${scriptName}.json.`, response
          );
        }
      }
      // Otherwise, if the path and the request specify a batch:
      else if (
        pathName === '/batchNames'
        && query.batchDir
        && query.batchCmdDir
        && query.reportDir
        && query.batchName
        && query.batchCmdName
      ) {
        const {batchDir, batchCmdDir, batchName, batchCmdName} = query;
        // Get the content of the batch.
        const batchJSON = await fs.readFile(`${batchDir}/${batchName}.json`, 'utf8');
        // When the content arrives, if there is any:
        if (batchJSON) {
          // Get the batch data.
          const batch = JSON.parse(batchJSON);
          const batchWhat = batch.what;
          const {urls} = batch;
          // If the batch is valid:
          if (
            batchWhat
            && urls
            && typeof batchWhat === 'string'
            && Array.isArray(urls)
            && urls.every(url => url.which && url.what)
          ) {
            // Get the content of the commands.
            const cmdJSON = await fs.readFile(`${batchCmdDir}/${batchCmdName}.json`, 'utf8');
            // When the content arrives, if there is any:
            if (cmdJSON) {
              // Get the command data.
              const cmds = JSON.parse(cmdJSON);
              const {what, browser, acts} = cmds;
              // If the command list is valid:
              if (
                what
                && browser
                && acts
                && typeof what === 'string'
                && ['chromium', 'firefox', 'webkit'].includes(browser)
                && Array.isArray(acts)
                && acts.length
                && acts.every(act => isValid(act) && ! ['launch', 'url'].includes(act.type))
              ) {
                // Prepend launch and generic url acts to the commands.
                acts.unshift(
                  {
                    type: 'launch',
                    which: browser
                  },
                  {
                    type: 'url',
                    which: '',
                    what: ''
                  }
                );
                // FUNCTION DEFINITION START
                // Recursively process commands on URLs.
                const doBatch = async (urls, isFirst, urlIndex) => {
                  if (urls.length) {
                    const firstURL = urls[0];
                    acts[1].which = firstURL.which;
                    acts[1].what = firstURL.what;
                    // Process the commands on the URL.
                    let stage = 'more';
                    if (isFirst) {
                      stage = urls.length > 1 ? 'start' : 'all';
                    }
                    else {
                      stage = urls.length > 1 ? 'more' : 'end';
                    }
                    await scriptHandler(
                      false, batchCmdName, what, acts, query, stage, urlIndex, response
                    );
                    // Process the remaining URLs.
                    await doBatch(urls.slice(1), false, urlIndex + 1);
                  }
                };
                // FUNCTION DEFINITION END
                // Process the commands on the URLs.
                doBatch(urls, true, 0);
              }
              // Otherwise, i.e. if the command list is invalid:
              else {
                // Serve an error message.
                serveMessage(`ERROR: Command list ${batchCmdName} invalid.`, response);
              }
            }
            // Otherwise, i.e. if the command list has no content:
            else {
              // Serve an error message.
              serveMessage(
                `ERROR: No commands found in ${batchCmdDir}/${batchCmdName}.json.`, response
              );
            }
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
          serveMessage(
            `ERROR: No batch found in ${batchDir}/${batchName}.json.`, response
          );
        }
      }
      // Otherwise, i.e. if the path or the request is invalid:
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
