/*
  run.js
  testaro main script.
*/

// ########## IMPORTS

// Module to keep secrets.
require('dotenv').config();
// Requirements for commands.
const {commands} = require('./commands');

// ########## CONSTANTS

// Set DEBUG environment variable to 'true' to add debugging features.
const debug = process.env.DEBUG === 'true';
// Set WAITS environment variable to a positive number to insert delays (in ms).
const waits = Number.parseInt(process.env.WAITS) || 0;
const urlInject = process.env.URL_INJECT || 'yes';
// CSS selectors for targets of moves.
const moves = {
  button: 'button, [role=button], input[type=submit]',
  checkbox: 'input[type=checkbox]',
  focus: true,
  link: 'a, [role=link]',
  radio: 'input[type=radio]',
  select: 'select',
  text: 'input[type=text]'
};
// Names and descriptions of tests.
const tests = {
  alfa: 'alfa',
  axe: 'Axe',
  bulk: 'count of visible elements',
  continuum: 'Level Access Continuum, community edition',
  docType: 'document without a doctype property',
  elements: 'data on specified elements',
  embAc: 'active elements embedded in links or buttons',
  focAll: 'focusable and Tab-focused elements',
  focInd: 'focus indicators',
  focOp: 'focusability and operability',
  focVis: 'links that are invisible when focused',
  hover: 'hover-caused content changes',
  htmlcs: 'HTML CodeSniffer WCAG 2.1 AA ruleset',
  ibm: 'IBM Accessibility Checker',
  labClash: 'labeling inconsistencies',
  linkTo: 'links without destinations',
  linkUl: 'adjacent-link underlining',
  menuNav: 'keyboard navigation between focusable menu items',
  miniText: 'text smaller than 11 pixels',
  motion: 'motion',
  nonTable: 'table elements used for layout',
  nuVal: 'failures to pass the Nu Html Checker',
  radioSet: 'fieldset grouping of radio buttons',
  role: 'roles',
  styleDiff: 'style inconsistencies',
  tabNav: 'keyboard navigation between tab elements',
  tenon: 'Tenon',
  title: 'page title',
  titledEl: 'title attributes on inappropriate elements',
  wave: 'WAVE',
  zIndex: 'z indexes'
};
// Tests that may change the DOM.
const domChangers = new Set([
  'axe', 'continuum', 'focAll', 'focInd', 'focOp', 'hover', 'htmlcs', 'ibm', 'menuNav', 'wave'
]);
// Browser types available in PlayWright.
const browserTypeNames = {
  'chromium': 'Chrome',
  'webkit': 'Safari',
  'firefox': 'Firefox'
};
// Items that may be waited for.
const waitables = ['url', 'title', 'body'];
// Tenon data.
const tenonData = {
  accessToken: '',
  requestIDs: {}
};
// Keywords in log messages indicating errors.
const errorWords = [
  'content security policy',
  'deprecated',
  'error',
  'expected',
  'failed',
  'invalid',
  'missing',
  'but not used',
  'refused',
  'requires',
  'suspicious',
  'unrecognized',
  'violates',
  'warning'
];

// ########## VARIABLES

// Facts about the current session.
let logCount = 0;
let logSize = 0;
let errorLogCount = 0;
let errorLogSize = 0;
let prohibitedCount = 0;
let visitTimeoutCount = 0;
let visitRejectionCount = 0;
let visitLatency = 0;
let actCount = 0;
// Facts about the current browser.
let browser;
let browserContext;
let browserTypeName;
let requestedURL = '';

// ########## VALIDATORS

// Validates a browser type.
const isBrowserType = type => ['chromium', 'firefox', 'webkit'].includes(type);
// Validates a load state.
const isState = string => ['loaded', 'idle'].includes(string);
// Validates a URL.
const isURL = string => /^(?:https?|file):\/\/[^\s]+$/.test(string);
// Validates a focusable tag name.
const isFocusable = string => ['a', 'button', 'input', 'select'].includes(string);
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
    else if (subtype === 'isState') {
      return isState(variable);
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
const isValidCommand = command => {
  // Identify the type of the command.
  const type = command.type;
  // If the type exists and is known:
  if (type && commands.etc[type]) {
    // Copy the validator of the type for possible expansion.
    const validator = Object.assign({}, commands.etc[type][1]);
    // If the type is test:
    if (type === 'test') {
      // Identify the test.
      const testName = command.which;
      // If one was specified and is known:
      if (testName && tests[testName]) {
        // If it has special properties:
        if (commands.tests[testName]) {
          // Expand the validator by adding them.
          Object.assign(validator, commands.tests[testName][1]);
        }
      }
      // Otherwise, i.e. if no or an unknown test was specified:
      else {
        // Return invalidity.
        return false;
      }
    }
    // Return whether the command is valid.
    return Object.keys(validator).every(property => {
      if (property === 'name') {
        return true;
      }
      else {
        const vP = validator[property];
        const cP = command[property];
        // If it is optional and omitted or present and valid:
        const optAndNone = ! vP[0] && ! cP;
        const isValidCommand = cP !== undefined && hasType(cP, vP[1]) && hasSubtype(cP, vP[2]);
        return optAndNone || isValidCommand;
      }
    });
  }
  // Otherwise, i.e. if the command has an unknown or no type:
  else {
    // Return invalidity.
    return false;
  }
};
// Validates a script.
const isValidScript = script => {
  // Get the script data.
  const {what, strict, commands} = script;
  // Return whether the script is valid:
  return what
    && typeof strict === 'boolean'
    && commands
    && typeof what === 'string'
    && Array.isArray(commands)
    && commands[0].type === 'launch'
    && commands.length > 1
    && commands[1].type === 'url'
    && isURL(commands[1].which)
    && commands.every(command => isValidCommand(command));
};
// Validates an initialized reports array.
const isValidActs = acts => Array.isArray(acts) && ! acts.length;
// Validates an initialized log array.
const isValidLog = log => Array.isArray(log) && ! log.length;
// Validates a report object.
const isValidReport = async report => {
  if (report) {
    const {script, log, acts} = report;
    return isValidScript(script)
    && isValidLog(log)
    && isValidActs(acts);
  }
  else {
    return false;
  }
};

// ########## OTHER FUNCTIONS

// Closes the current browser.
const browserClose = async () => {
  if (browser) {
    const contexts = browser.contexts();
    for (const context of contexts) {
      await context.close();
    }
    await browser.close();
  }
};
// Launches a browser.
const launch = async typeName => {
  const browserType = require('playwright')[typeName];
  // If the specified browser type exists:
  if (browserType) {
    // Close the current browser, if any.
    await browserClose();
    // Launch a browser of that type.
    const browserOptions = {};
    if (debug) {
      browserOptions.headless = false;
    }
    if (waits) {
      browserOptions.slowMo = waits;
    }
    let healthy = true;
    browser = await browserType.launch(browserOptions)
    .catch(error => {
      healthy = false;
      console.log(`ERROR launching browser: ${error.message.replace(/\n.+/s, '')}`);
    });
    // If the launch succeeded:
    if (healthy) {
      // Create a new context (window) in it, taller if debugging is on.
      const viewport = debug ? {
        viewPort: {
          width: 1280,
          height: 1120
        }
      } : {};
      browserContext = await browser.newContext(viewport);
      // When a page is added to the browser context:
      browserContext.on('page', page => {
        // Make abbreviations of its console messages get reported in the Playwright console.
        page.on('console', msg => {
          const msgText = msg.text();
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
          const indentedMsg = parts.map(part => `    | ${part}`).join('\n');
          console.log(`\n${indentedMsg}`);
          const msgTextLC = msgText.toLowerCase();
          const msgLength = msgText.length;
          logCount++;
          logSize += msgLength;
          if (errorWords.some(word => msgTextLC.includes(word))) {
            errorLogCount++;
            errorLogSize += msgLength;
          }
          const msgLC = msgText.toLowerCase();
          if (msgText.includes('403') && (msgLC.includes('status') || msgLC.includes('prohibited'))) {
            prohibitedCount++;
          }
        });
      });
      // Open the first page of the context.
      const page = await browserContext.newPage();
      if (debug) {
        page.setViewportSize({
          width: 1280,
          height: 1120
        });
      }
      // Wait until it is stable.
      await page.waitForLoadState('domcontentloaded');
      // Update the name of the current browser type and store it in the page.
      page.browserTypeName = browserTypeName = typeName;
    }
  }
};
// Normalizes spacing characters and cases in a string.
const debloat = string => string.replace(/\s/g, ' ').trim().replace(/ {2,}/g, ' ').toLowerCase();
// Returns the text of an element, lower-cased.
const textOf = async (page, element) => {
  if (element) {
    const tagNameJSHandle = await element.getProperty('tagName');
    const tagName = await tagNameJSHandle.jsonValue();
    let totalText = '';
    // If the element is a link, button, input, or select list:
    if (['A', 'BUTTON', 'INPUT', 'SELECT'].includes(tagName)) {
      // Return its visible labels, descriptions, and legend if the first input in a fieldset.
      totalText = await page.evaluate(element => {
        const {tagName, ariaLabel} = element;
        let ownText = '';
        if (['A', 'BUTTON'].includes(tagName)) {
          ownText = element.textContent;
        }
        else if (tagName === 'INPUT' && element.type === 'submit') {
          ownText = element.value;
        }
        // HTML link elements have no labels property.
        const labels = tagName !== 'A' ? Array.from(element.labels) : [];
        const labelTexts = labels.map(label => label.textContent);
        if (ariaLabel) {
          labelTexts.push(ariaLabel);
        }
        const refIDs = new Set([
          element.getAttribute('aria-labelledby') || '',
          element.getAttribute('aria-describedby') || ''
        ].join(' ').split(/\s+/));
        if (refIDs.size) {
          refIDs.forEach(id => {
            const labeler = document.getElementById(id);
            if (labeler) {
              const labelerText = labeler.textContent.trim();
              if (labelerText.length) {
                labelTexts.push(labelerText);
              }
            }
          });
        }
        let legendText = '';
        if (tagName === 'INPUT') {
          const fieldsets = Array.from(document.body.querySelectorAll('fieldset'));
          const inputFieldsets = fieldsets.filter(fieldset => {
            const inputs = Array.from(fieldset.querySelectorAll('input'));
            return inputs.length && inputs[0] === element;
          });
          const inputFieldset = inputFieldsets[0] || null;
          if (inputFieldset) {
            const legend = inputFieldset.querySelector('legend');
            if (legend) {
              legendText = legend.textContent;
            }
          }
        }
        return [legendText].concat(labelTexts, ownText).join(' ');
      }, element);
    }
    // Otherwise, if it is an option:
    else if (tagName === 'OPTION') {
      // Return its text content, prefixed with the text of its select parent if the first option.
      const ownText = await element.textContent();
      const indexJSHandle = await element.getProperty('index');
      const index = await indexJSHandle.jsonValue();
      if (index) {
        totalText = ownText;
      }
      else {
        const selectJSHandle = await page.evaluateHandle(
          element => element.parentElement, element
        );
        const select = await selectJSHandle.asElement();
        if (select) {
          const selectText = await textOf(page, select);
          totalText = [ownText, selectText].join(' ');
        }
        else {
          totalText = ownText;
        }
      }
    }
    // Otherwise, i.e. if it is not an input, select, or option:
    else {
      // Get its text content.
      totalText = await element.textContent();
    }
    return debloat(totalText);
  }
  else {
    return null;
  }
};
// Returns an element of a type case-insensitively including a text.
const matchElement = async (page, selector, matchText, index = 0) => {
  if (matchText) {
    // If the page still exists:
    if (page) {
      const slimText = debloat(matchText);
      // Identify the elements of the specified type.
      const selections = await page.$$(selector);
      // If there are any:
      if (selections.length) {
        // If there are enough to make a match possible:
        if (index < selections.length) {
          // For each element of the specified type:
          let matchCount = 0;
          const selectionTexts = [];
          for (const selection of selections) {
            // Add its text to the list of texts of such elements.
            const selectionText = await textOf(page, selection);
            selectionTexts.push(selectionText);
            // If its text includes the specified text:
            if (selectionText.includes(slimText)) {
              // If the count of such elements with such texts found so far is the specified count:
              if (matchCount++ === index) {
                // Return it as the matching element.
                return {
                  success: true,
                  matchingElement: selection
                };
              }
            }
          }
          // None satisfied the specifications, so return a failure.
          return {
            success: false,
            error: 'exhausted',
            message: `Text found in only ${matchCount} (not ${index + 1}) of ${selections.length}`,
            candidateTexts: selectionTexts
          };
        }
        // Otherwise, i.e. if there are too few such elements to make a match possible:
        else {
          // Return a failure.
          return {
            success: false,
            error: 'fewer',
            message: `Count of '${selector}' elements only ${selections.length}`
          };
        }
      }
      // Otherwise, i.e. if there are no elements of the specified type:
      else {
        // Return a failure.
        return {
          success: false,
          error: 'none',
          message: `No '${selector}' elements found`
        };
      }
    }
    // Otherwise, i.e. if the page no longer exists:
    else {
      // Return a failure.
      return {
        success: false,
        error: 'gone',
        message: 'Page gone'
      };
    }
  }
  // Otherwise, i.e. if no text was specified:
  else {
    // Return a failure.
    return {
      success: false,
      error: 'text',
      message: 'No text specified'
    };
  }
};
// Returns a string with any final slash removed.
const deSlash = string => string.endsWith('/') ? string.slice(0, -1) : string;
// Tries to visit a URL.
const goto = async (page, url, timeout, waitUntil, isStrict) => {
  if (url.startsWith('file://.')) {
    url = url.replace('file://', `file://${__dirname}/`);
  }
  // Visit the URL.
  const startTime = Date.now();
  const response = await page.goto(url, {
    timeout,
    waitUntil
  })
  .catch(error => {
    console.log(`ERROR: Visit to ${url} timed out before ${waitUntil} (${error.message})`);
    visitTimeoutCount++;
    return 'error';
  });
  visitLatency += Math.round((Date.now() - startTime) / 1000);
  // If the visit succeeded:
  if (typeof response !== 'string') {
    const httpStatus = response.status();
    // If the response status was normal:
    if ([200, 304].includes(httpStatus) || url.startsWith('file:')) {
      // If the browser was redirected in violation of a strictness requirement.
      const actualURL = page.url();
      if (isStrict && deSlash(actualURL) !== deSlash(url)) {
        // Return an error.
        console.log(`ERROR: Visit to ${url} redirected to ${actualURL}`);
        return 'redirection';
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
      visitRejectionCount++;
      return 'error';
    }
  }
  // Otherwise, i.e. if the visit failed:
  else {
    // Return an error.
    return 'error';
  }
};
// Visits the URL that is the value of the “which” property of an act.
const visit = async (act, page, isStrict) => {
  // Identify the URL.
  const resolved = act.which.replace('__dirname', __dirname);
  requestedURL = resolved;
  // Visit it and wait 15 seconds or until the network is idle.
  let response = await goto(page, requestedURL, 15000, 'networkidle', isStrict);
  // If the visit fails:
  if (response === 'error') {
    // Try again, but waiting 10 seconds or until the DOM is loaded.
    response = await goto(page, requestedURL, 10000, 'domcontentloaded', isStrict);
    // If the visit fails:
    if (response === 'error') {
      // Launch another browser type.
      const newBrowserName = Object.keys(browserTypeNames)
      .find(name => name !== browserTypeName);
      console.log(`>> Launching ${newBrowserName} instead`);
      await launch(newBrowserName);
      // Identify its only page as current.
      page = browserContext.pages()[0];
      // Try again, waiting 10 seconds or until the network is idle.
      response = await goto(page, requestedURL, 10000, 'networkidle', isStrict);
      // If the visit fails:
      if (response === 'error') {
        // Try again, but waiting 5 seconds or until the DOM is loaded.
        response = await goto(page, requestedURL, 5000, 'domcontentloaded', isStrict);
        // If the visit fails:
        if (response === 'error') {
          // Try again, waiting 5 seconds or until a load.
          response = await goto(page, requestedURL, 5000, 'load', isStrict);
          // If the visit fails:
          if (response === 'error') {
            // Give up.
            const errorMsg = `ERROR: Attempts to visit ${requestedURL} failed`;
            console.log(errorMsg);
            act.result = errorMsg;
            await page.goto('about:blank')
            .catch(error => {
              console.log(`ERROR: Navigation to blank page failed (${error.message})`);
            });
            return null;
          }
        }
      }
    }
  }
  // If one of the visits succeeded:
  if (response) {
    // Add the resulting URL to the act.
    if (isStrict && response === 'redirection') {
      act.error = 'ERROR: Navigation redirected';
    }
    act.result = page.url();
    // Return the page.
    return page;
  }
};
// Returns a property value and whether it satisfies an expectation.
const isTrue = (object, specs) => {
  let satisfied;
  const property = specs[0];
  const propertyTree = property.split('.');
  const relation = specs[1];
  const criterion = specs[2];
  let actual = property.length ? object[propertyTree[0]] : object;
  // Identify the actual value of the specified property.
  while (propertyTree.length > 1 && actual !== undefined) {
    propertyTree.shift();
    actual = actual[propertyTree[0]];
  }
  // Determine whether the expectation was fulfilled.
  if (relation === '=') {
    satisfied = actual === criterion;
  }
  else if (relation === '<') {
    satisfied = actual < criterion;
  }
  else if (relation === '>') {
    satisfied = actual > criterion;
  }
  else if (relation === '!') {
    satisfied = actual !== criterion;
  }
  else if (! relation) {
    satisfied = actual === undefined;
  }
  return [actual, satisfied];
};
// Adds a wait error result to an act.
const waitError = (page, act, error, what) => {
  console.log(`ERROR waiting for ${what} (${error.message})`);
  act.result.found = false;
  act.result.url = page.url();
  act.result.error = `ERROR waiting for ${what}`;
  return false;
};
// Waits.
const wait = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};
// Adds an error result to an act.
const addError = (act, error) => {
  act.result = {
    error
  };
  if (act.type === 'test') {
    act.result.prevented = true;
  }
};
// Recursively performs the acts in a report.
const doActs = async (report, actIndex, page) => {
  process.on('message', message => {
    if (message === 'interrupt') {
      console.log('ERROR: Terminal interrupted doActs');
      process.exit();
    }
  });
  const {acts} = report;
  // If any more commands are to be performed:
  if (actIndex > -1 && actIndex < acts.length) {
    // Identify the command to be performed.
    const act = acts[actIndex];
    // If it is valid:
    if (isValidCommand(act)) {
      const whichSuffix = act.which ? ` (${act.which})` : '';
      console.log(`>>>> ${act.type}${whichSuffix}`);
      // Increment the count of commands performed.
      actCount++;
      // If the command is an index changer:
      if (act.type === 'next') {
        const condition = act.if;
        const logSuffix = condition.length === 3 ? ` ${condition[1]} ${condition[2]}` : '';
        console.log(`>> ${condition[0]}${logSuffix}`);
        // Identify the act to be checked.
        const ifActIndex = report.acts.map(act => act.type !== 'next').lastIndexOf(true);
        // Determine whether its jump condition is true.
        const truth = isTrue(report.acts[ifActIndex].result, condition);
        // Add the result to the act.
        act.result = {
          property: condition[0],
          relation: condition[1],
          criterion: condition[2],
          value: truth[0],
          jumpRequired: truth[1]
        };
        // If the condition is true:
        if (truth[1]) {
          // If the performance of commands is to stop:
          if (act.jump === 0) {
            // Stop.
            actIndex = -2;
          }
          // Otherwise, if there is a numerical jump:
          else if (act.jump) {
            // Set the act index accordingly.
            actIndex += act.jump - 1;
          }
          // Otherwise, if there is a named next command:
          else if (act.next) {
            // Set the new index accordingly, or stop if it does not exist.
            actIndex = acts.map(act => act.name).indexOf(act.next) - 1;
          }
        }
      }
      // Otherwise, if the command is a launch:
      else if (act.type === 'launch') {
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
          page = await visit(act, page, report.isStrict);
        }
        // Otherwise, if the act is a wait for text:
        else if (act.type === 'wait') {
          const {what, which} = act;
          console.log(`>> ${what}`);
          const result = act.result = {};
          // If the text is to be the URL:
          if (what === 'url') {
            // Wait for it up to 15 seconds and quit on failure.
            try {
              await page.waitForURL(which, {timeout: 15000});
              result.found = true;
              result.url = page.url();
            }
            catch(error) {
              actIndex = -2;
              waitError(page, act, error, 'URL');
            }
          }
          // Otherwise, if the text is to be a substring of the page title:
          else if (what === 'title') {
            // Wait for it up to 5 seconds and quit on failure.
            try {
              await page.waitForFunction(
                text => document
                && document.title
                && document.title.toLowerCase().includes(text.toLowerCase()),
                which,
                {
                  polling: 1000,
                  timeout: 5000
                }
              );
              result.found = true;
              result.title = await page.title();
            }
            catch(error) {
              actIndex = -2;
              waitError(page, act, error, 'title');
            }
          }
          // Otherwise, if the text is to be a substring of the text of the page body:
          else if (what === 'body') {
            // Wait for it up to 10 seconds and quit on failure.
            try {
              await page.waitForFunction(
                text => document
                && document.body
                && document.body.innerText.toLowerCase().includes(text.toLowerCase()),
                which,
                {
                  polling: 2000,
                  timeout: 10000
                }
              );
              result.found = true;
            }
            catch(error) {
              actIndex = -2;
              waitError(page, act, error, 'body');
            }
          }
        }
        // Otherwise, if the act is a wait for a state:
        else if (act.type === 'state') {
          // Wait for it up to 5 or 10 seconrds, and quit on failure.
          const stateIndex = ['loaded', 'idle'].indexOf(act.which);
          await page.waitForLoadState(
            ['domcontentloaded', 'networkidle'][stateIndex], {timeout: [10000, 5000][stateIndex]}
          )
          .catch(error => {
            console.log(`ERROR waiting for page to be ${act.which} (${error.message})`);
            act.result = {
              success: false,
              error: `ERROR waiting for page to be ${act.which}`
            };
            actIndex = -2;
          });
          if (actIndex > -2) {
            act.result = {
              success: true,
              state: act.which
            };
          }
        }
        // Otherwise, if the act is a page switch:
        else if (act.type === 'page') {
          // Wait for a page to be created and identify it as current.
          page = await browserContext.waitForEvent('page');
          // Wait up to 20 seconds until it is idle.
          await page.waitForLoadState('networkidle', {timeout: 20000});
          // Add the resulting URL to the act.
          const result = {
            url: page.url()
          };
          act.result = result;
        }
        // Otherwise, if the page has a URL:
        else if (page.url() && page.url() !== 'about:blank') {
          const url = page.url();
          // If redirection is permitted or did not occur:
          if (! report.strict || deSlash(url) === deSlash(requestedURL)) {
            // Add the URL to the act.
            act.url = url;
            // If the act is a revelation:
            if (act.type === 'reveal') {
              // Make all elements in the page visible.
              await require('./procs/allVis').allVis(page);
              act.result = {
                success: true
              };
            }
            // Otherwise, if the act is a tenon request:
            else if (act.type === 'tenonRequest') {
              const {id, withNewContent} = act;
              const https = require('https');
              // If a Tenon access token has not yet been obtained:
              if (! tenonData.accessToken) {
                // Authenticate with the Tenon API.
                const authData = await new Promise(resolve => {
                  const request = https.request(
                    {
                      host: 'tenon.io',
                      path: '/api/v2/auth',
                      port: 443,
                      protocol: 'https:',
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                      }
                    },
                    response => {
                      let responseData = '';
                      response.on('data', chunk => {
                        responseData += chunk;
                      });
                      response.on('end', () => {
                        try {
                          const responseJSON = JSON.parse(responseData);
                          return resolve(responseJSON);
                        }
                        catch(error) {
                          return resolve({
                            error: 'Tenon did not return JSON authentication data.',
                            responseData
                          });
                        }
                      });
                    }
                  );
                  const tenonUser = process.env.TENON_USER;
                  const tenonPassword = process.env.TENON_PASSWORD;
                  const postData = JSON.stringify({
                    username: tenonUser,
                    password: tenonPassword
                  });
                  request.write(postData);
                  request.end();
                });
                // If the authentication succeeded:
                if (authData.access_token) {
                  // Record the access token.
                  tenonData.accessToken = authData.access_token;
                }
                // Otherwise, i.e. if the authentication failed:
                else {
                  console.log('ERROR: tenon authentication failed');
                }
              }
              // If a Tenon access token exists:
              if (tenonData.accessToken) {
                // Request a Tenon test of the page and get a response ID.
                const option = {};
                // If Tenon is to be given the URL and not the content of the page:
                if (withNewContent) {
                  // Specify this.
                  option.url = page.url();
                }
                // Otherwise, i.e. if Tenon is to be given the page content:
                else {
                  // Specify this.
                  option.src = await page.content();
                }
                // Request a Tenon test and get a response ID.
                const responseID = await new Promise(resolve => {
                  const request = https.request(
                    {
                      host: 'tenon.io',
                      path: '/api/v2/',
                      port: 443,
                      protocol: 'https:',
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        Authorization: `Bearer ${tenonData.accessToken}`
                      }
                    },
                    response => {
                      let resultJSON = '';
                      response.on('data', chunk => {
                        resultJSON += chunk;
                      });
                      // When the data arrive, return them as an object.
                      response.on('end', () => {
                        try {
                          const result = JSON.parse(resultJSON);
                          resolve(result.data.responseID || '');
                        }
                        catch (error) {
                          console.log('ERROR: Tenon did not return JSON.');
                          resolve('');
                        }
                      });
                    }
                  );
                  const postData = JSON.stringify(option);
                  request.write(postData);
                  request.end();
                });
                // Record the response ID.
                tenonData.requestIDs[id] = responseID || '';
              }
            }
            // Otherwise, if the act is a test:
            else if (act.type === 'test') {
              // Add a description of the test to the act.
              act.what = tests[act.which];
              // Initialize the arguments.
              const args = [act.which === 'tenon' ? tenonData : page];
              // Identify the additional validator of the test.
              const testValidator = commands.tests[act.which];
              // If it exists:
              if (testValidator) {
                // Identify its argument properties.
                const argProperties = Object.keys(testValidator[1]);
                // Add their values to the arguments.
                args.push(...argProperties.map(propName => act[propName]));
              }
              // Conduct, report, and time the test.
              const startTime = Date.now();
              const testReport = await require(`./tests/${act.which}`).reporter(...args);
              const expectations = act.expect;
              // If the test has expectations:
              if (expectations) {
                // Initialize whether they were fulfilled.
                testReport.result.expectations = [];
                let failureCount = 0;
                // For each expectation:
                expectations.forEach(spec => {
                  const truth = isTrue(testReport.result, spec);
                  testReport.result.expectations.push({
                    property: spec[0],
                    relation: spec[1],
                    criterion: spec[2],
                    actual: truth[0],
                    passed: truth[1]
                  });
                  if (! truth[1]) {
                    failureCount++;
                  }
                });
                testReport.result.failureCount = failureCount;
              }
              testReport.result.success = true;
              report.testTimes.push([act.which, Math.round((Date.now() - startTime) / 1000)]);
              report.testTimes.sort((a, b) => b[1] - a[1]);
              // Add the result object (possibly an array) to the act.
              const resultCount = Object.keys(testReport.result).length;
              act.result = resultCount ? testReport.result : {success: false};
            }
            // Otherwise, if the act is a move:
            else if (moves[act.type]) {
              const selector = typeof moves[act.type] === 'string' ? moves[act.type] : act.what;
              // Try up to 5 times, every 2 seconds, to identify the element to perform the move on.
              let matchResult = {found: false};
              let tries = 0;
              while (tries++ < 5 && ! matchResult.found) {
                matchResult = await matchElement(page, selector, act.which || '', act.index);
                if (! matchResult.found) {
                  await wait(2000);
                }
              }
              // If a match was found:
              if (matchResult.found) {
                act.result = {found: true};
                const {matchingElement} = matchResult;
                // If the move is a button click, perform it.
                if (act.type === 'button') {
                  await matchingElement.click({timeout: 3000});
                  act.result.success = true;
                  act.result.move = 'clicked';
                }
                // Otherwise, if it is checking a radio button or checkbox, perform it.
                else if (['checkbox', 'radio'].includes(act.type)) {
                  await matchingElement.waitForElementState('stable', {timeout: 2000})
                  .catch(error => {
                    console.log(`ERROR waiting for stable ${act.type} (${error.message})`);
                    act.result.success = false;
                    act.result.error = `ERROR waiting for stable ${act.type}`;
                  });
                  if (! act.result) {
                    const isEnabled = await matchingElement.isEnabled();
                    if (isEnabled) {
                      await matchingElement.check({
                        force: true,
                        timeout: 2000
                      })
                      .catch(error => {
                        console.log(`ERROR checking ${act.type} (${error.message})`);
                        addError(act, `ERROR checking ${act.type}`);
                      });
                      if (! act.result) {
                        act.result = 'checked';
                      }
                    }
                    else {
                      const report = `ERROR: could not check ${act.type} because disabled`;
                      console.log(report);
                      act.result = report;
                    }
                  }
                }
                // Otherwise, if it is focusing the element, perform it.
                else if (act.type === 'focus') {
                  await matchingElement.focus({timeout: 2000});
                  act.result = 'focused';
                }
                // Otherwise, if it is clicking a link:
                else if (act.type === 'link') {
                  // Try to click it.
                  const href = await matchingElement.getAttribute('href');
                  const target = await matchingElement.getAttribute('target');
                  await matchingElement.click({timeout: 3000})
                  // If it cannot be clicked within 3 seconds:
                  .catch(async error => {
                    // Try to force-click it without actionability checks.
                    const errorSummary = error.message.replace(/\n.+/, '');
                    console.log(`ERROR: Link to ${href} not clickable (${errorSummary})`);
                    await matchingElement.click({
                      force: true
                    })
                    // If it cannot be force-clicked:
                    .catch(error => {
                      // Quit and report the failure.
                      actIndex = -2;
                      const errorSummary = error.message.replace(/\n.+/, '');
                      console.log(`ERROR: Link to ${href} not force-clickable (${errorSummary})`);
                      act.result = {
                        href: href || 'NONE',
                        target: target || 'NONE',
                        error: 'ERROR: Normal and forced attempts to click link timed out'
                      };
                    });
                  });
                  let loadState = 'idle';
                  // Wait up to 3 seconds for the resulting page to be idle.
                  await page.waitForLoadState('networkidle', {timeout: 3000})
                  // If the wait times out:
                  .catch(async () => {
                    loadState = 'loaded';
                    // Wait up to 2 seconds for the page to be loaded.
                    await page.waitForLoadState('domcontentloaded', {timeout: 2000})
                    // If the wait times out:
                    .catch(() => {
                      loadState = 'incomplete';
                      // Proceed but report the timeout.
                      console.log('ERROR waiting for page to load after link activation');
                    });
                  });
                  // If it was clicked:
                  if (actIndex > -2) {
                    // Report the success.
                    act.result = {
                      href: href || 'NONE',
                      target: target || 'NONE',
                      move: 'clicked',
                      loadState
                    };
                  }
                }
                // Otherwise, if it is selecting an option in a select list, perform it.
                else if (act.type === 'select') {
                  const options = await matchingElement.$$('option');
                  let optionText = '';
                  if (options && Array.isArray(options) && options.length) {
                    const optionTexts = [];
                    for (const option of options) {
                      const optionText = await option.textContent();
                      optionTexts.push(optionText);
                    }
                    const matchTexts = optionTexts.map(
                      (text, index) => text.includes(act.what) ? index : -1
                    );
                    const index = matchTexts.filter(text => text > -1)[act.index || 0];
                    if (index !== undefined) {
                      await matchingElement.selectOption({index});
                      optionText = optionTexts[index];
                    }
                  }
                  act.result = optionText
                    ? `“${optionText}” selected`
                    : 'ERROR: option not found';
                }
                // Otherwise, if it is entering text on the element:
                else if (act.type === 'text') {
                  // If the text contains a placeholder for an environment variable:
                  let {what} = act;
                  if (/__[A-Z]+__/.test(what)) {
                    // Replace it.
                    const envKey = /__([A-Z]+)__/.exec(what)[1];
                    const envValue = process.env[envKey];
                    what = what.replace(/__[A-Z]+__/, envValue);
                  }
                  // Enter the text.
                  await matchingElement.type(act.what);
                  report.presses += act.what.length;
                  act.result = 'entered';
                }
                // Otherwise, i.e. if the move is unknown, add the failure to the act.
                else {
                  // Report the error.
                  const report = 'ERROR: move unknown';
                  act.result = report;
                  console.log(report);
                }
              }
              // Otherwise, i.e. if no match was found:
              else {
                // Stop.
                act.result = matchResult;
                console.log('ERROR: Specified element not found');
                actIndex = -2;
              }
            }
            // Otherwise, if the act is a keypress:
            else if (act.type === 'press') {
              // Identify the number of times to press the key.
              let times = 1 + (act.again || 0);
              report.presses += times;
              const key = act.which;
              // Press the key.
              while (times--) {
                await page.keyboard.press(key);
              }
              const qualifier = act.again ? `${1 + act.again} times` : 'once';
              act.result = `pressed ${qualifier}`;
            }
            // Otherwise, if it is a repetitive keyboard navigation:
            else if (act.type === 'presses') {
              const {navKey, what, which, withItems} = act;
              const matchTexts = which ? which.map(text => debloat(text)) : [];
              // Initialize the loop variables.
              let status = 'more';
              let presses = 0;
              let amountRead = 0;
              let items = [];
              let matchedText;
              // As long as a matching element has not been reached:
              while (status === 'more') {
                // Press the Escape key to dismiss any modal dialog.
                await page.keyboard.press('Escape');
                // Press the specified navigation key.
                await page.keyboard.press(navKey);
                presses++;
                // Identify the newly current element or a failure.
                const currentJSHandle = await page.evaluateHandle(actCount => {
                  // Initialize it as the focused element.
                  let currentElement = document.activeElement;
                  // If it exists in the page:
                  if (currentElement && currentElement.tagName !== 'BODY') {
                    // Change it, if necessary, to its active descendant.
                    if (currentElement.hasAttribute('aria-activedescendant')) {
                      currentElement = document.getElementById(
                        currentElement.getAttribute('aria-activedescendant')
                      );
                    }
                    // Or change it, if necessary, to its selected option.
                    else if (currentElement.tagName === 'SELECT') {
                      const currentIndex = Math.max(0, currentElement.selectedIndex);
                      const options = currentElement.querySelectorAll('option');
                      currentElement = options[currentIndex];
                    }
                    // Or change it, if necessary, to its active shadow-DOM element.
                    else if (currentElement.shadowRoot) {
                      currentElement = currentElement.shadowRoot.activeElement;
                    }
                    // If there is a current element:
                    if (currentElement) {
                      // If it was already reached within this act:
                      if (currentElement.dataset.pressesReached === actCount.toString(10)) {
                        // Report the error.
                        console.log(`ERROR: ${currentElement.tagName} element reached again`);
                        status = 'ERROR';
                        return 'ERROR: locallyExhausted';
                      }
                      // Otherwise, i.e. if it is newly reached within this act:
                      else {
                        // Mark and return it.
                        currentElement.dataset.pressesReached = actCount;
                        return currentElement;
                      }
                    }
                    // Otherwise, i.e. if there is no current element:
                    else {
                      // Report the error.
                      status = 'ERROR';
                      return 'noActiveElement';
                    }
                  }
                  // Otherwise, i.e. if there is no focus in the page:
                  else {
                    // Report the error.
                    status = 'ERROR';
                    return 'ERROR: globallyExhausted';
                  }
                }, actCount);
                // If the current element exists:
                const currentElement = currentJSHandle.asElement();
                if (currentElement) {
                  // Update the data.
                  const tagNameJSHandle = await currentElement.getProperty('tagName');
                  const tagName = await tagNameJSHandle.jsonValue();
                  const text = await textOf(page, currentElement);
                  // If the text of the current element was found:
                  if (text !== null) {
                    const textLength = text.length;
                    // If it is non-empty and there are texts to match:
                    if (matchTexts.length && textLength) {
                      // Identify the matching text.
                      matchedText = matchTexts.find(matchText => text.includes(matchText));
                    }
                    // Update the item data if required.
                    if (withItems) {
                      const itemData = {
                        tagName,
                        text,
                        textLength
                      };
                      if (matchedText) {
                        itemData.matchedText = matchedText;
                      }
                      items.push(itemData);
                    }
                    amountRead += textLength;
                    // If there is no text-match failure:
                    if (matchedText || ! matchTexts.length) {
                      // If the element has any specified tag name:
                      if (! what || tagName === what) {
                        // Change the status.
                        status = 'done';
                        // Perform the action.
                        const inputText = act.text;
                        if (inputText) {
                          await page.keyboard.type(inputText);
                          presses += inputText.length;
                        }
                        if (act.action) {
                          presses++;
                          await page.keyboard.press(act.action);
                          await page.waitForLoadState();
                        }
                      }
                    }
                  }
                  else {
                    status = 'ERROR';
                  }
                }
                // Otherwise, i.e. if there was a failure:
                else {
                  // Update the status.
                  status = await currentJSHandle.jsonValue();
                }
              }
              // Add the result to the act.
              act.result = {
                status,
                totals: {
                  presses,
                  amountRead
                }
              };
              if (status === 'done' && matchedText) {
                act.result.matchedText = matchedText;
              }
              if (withItems) {
                act.result.items = items;
              }
              // Add the totals to the report.
              report.presses += presses;
              report.amountRead += amountRead;
            }
            // Otherwise, i.e. if the act type is unknown:
            else {
              // Add the error result to the act.
              act.result = 'ERROR: invalid command type';
            }
          }
          // Otherwise, i.e. if redirection is prohibited but occurred:
          else {
            // Add an error result to the act.
            act.result = {
              success: false,
              error: `ERROR: Page URL wrong (${url})`
            };
          }
        }
        // Otherwise, i.e. if the required page URL does not exist:
        else {
          // Add an error result to the act.
          addError(act, 'ERROR: Page has no URL');
        }
      }
      // Otherwise, i.e. if no page exists:
      else {
        // Add an error result to the act.
        addError(act, 'ERROR: No page identified');
      }
    }
    // Otherwise, i.e. if the command is invalid:
    else {
      // Add an error result to the act.
      const errorMsg = `ERROR: Invalid command of type ${act.type}`;
      act.result = errorMsg;
      console.log(errorMsg);
      // Quit.
      actIndex = -2;
    }
    // Perform the remaining acts.
    await doActs(report, actIndex + 1, page);
  }
};
// Performs the commands in a script.
const doScript = async (report) => {
  // Reinitialize the log statistics.
  logCount = 0;
  logSize = 0;
  errorLogCount = 0;
  errorLogSize = 0;
  prohibitedCount = 0;
  visitTimeoutCount = 0;
  visitRejectionCount = 0;
  // Add the start time to the report.
  const startTime = new Date();
  report.startTime = startTime.toISOString().slice(0, 19);
  // Add initialized properties to the report.
  report.presses = 0;
  report.amountRead = 0;
  report.testTimes = [];
  // Perform the specified acts.
  await doActs(report, 0, null);
  // Add the log statistics to the report.
  report.logCount = logCount;
  report.logSize = logSize;
  report.errorLogCount = errorLogCount;
  report.errorLogSize = errorLogSize;
  report.prohibitedCount = prohibitedCount;
  report.visitTimeoutCount = visitTimeoutCount;
  report.visitRejectionCount = visitRejectionCount;
  report.visitLatency = visitLatency;
  // Add the end time and duration to the report.
  const endTime = new Date();
  report.endTime = endTime.toISOString().slice(0, 19);
  report.elapsedSeconds =  Math.floor((endTime - startTime) / 1000);
  // Add an end time to the log.
  report.log.push({
    event: 'endTime',
    value: ((new Date()).toISOString().slice(0, 19))
  });
};
// Injects launch and url acts into a report where necessary to undo DOM changes.
const injectLaunches = acts => {
  let injectMore = true;
  while (injectMore) {
    const injectIndex = acts.findIndex((act, index) =>
      index < acts.length - 1
      && act.type === 'test'
      && acts[index + 1].type === 'test'
      && domChangers.has(act.which)
    );
    if (injectIndex === -1) {
      injectMore = false;
    }
    else {
      const lastBrowserType = acts.reduce((browserType, act, index) => {
        if (act.type === 'launch' && index < injectIndex) {
          return act.which;
        }
        else {
          return browserType;
        }
      }, '');
      const lastURL = acts.reduce((url, act, index) => {
        if (act.type === 'url' && index < injectIndex) {
          return act.which;
        }
        else {
          return url;
        }
      }, '');
      acts.splice(
        injectIndex + 1,
        0,
        {
          type: 'launch',
          which: lastBrowserType,
          what: `${lastBrowserType} browser`
        },
        {
          type: 'url',
          which: lastURL,
          what: 'URL'
        }
      );
    }
  }
};
// Handles a request.
exports.handleRequest = async report => {
  // If the report object is valid:
  if(isValidReport(report)) {
    // Add a start time to the log.
    report.log.push(
      {
        event: 'startTime',
        value: ((new Date()).toISOString().slice(0, 19))
      }
    );
    // Add an ID to the report if none exists yet.
    if (! report.id) {
      report.id = Math.floor((Date.now() - Date.UTC(2022, 1)) / 2000).toString(36);
    }
    // Add a time stamp to the report.
    report.timeStamp = report.id.replace(/-.+/, '');
    // Add the script commands to the report as its initial acts.
    report.acts = JSON.parse(JSON.stringify(report.script.commands));
    /*
      Inject launch and url acts where necessary to undo DOM changes, if specified.
      Injection of url acts alone does not guarantee test independence.
    */
    if (urlInject === 'yes') {
      injectLaunches(report.acts);
    }
    // Perform the acts, asynchronously adding to the log and report.
    await doScript(report);
  }
  else {
    console.log('ERROR: options missing or invalid');
  }
};
