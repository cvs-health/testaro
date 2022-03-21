/*
  index.js
  testaro main script.
*/
// ########## IMPORTS
// Requirements for commands.
const {commands} = require('./commands');
// ########## CONSTANTS
// Set DEBUG environment variable to 'true' to add debugging features.
const debug = process.env.TESTARO_DEBUG === 'true';
// Set WAITS environment variable to a positive number to insert delays (in ms).
const waits = Number.parseInt(process.env.TESTARO_WAITS) || 0;
// CSS selectors for targets of moves.
const moves = {
  button: 'button',
  checkbox: 'input[type=checkbox]',
  focus: true,
  link: 'a',
  radio: 'input[type=radio]',
  select: 'select',
  text: 'input[type=text]'
};
// Names and descriptions of tests.
const tests = {
  aatt: 'AATT with HTML CodeSniffer WCAG 2.1 AA ruleset',
  alfa: 'alfa',
  axe: 'Axe',
  bulk: 'count of visible elements',
  embAc: 'active elements embedded in links or buttons',
  focAll: 'focusable and Tab-focused elements',
  focInd: 'focus indicators',
  focOp: 'focusability and operability',
  hover: 'hover-caused content additions',
  ibm: 'IBM Accessibility Checker',
  labClash: 'labeling inconsistencies',
  linkUl: 'inline-link underlining',
  menuNav: 'keyboard navigation between focusable menu items',
  motion: 'motion',
  radioSet: 'fieldset grouping of radio buttons',
  role: 'roles',
  styleDiff: 'style inconsistencies',
  tabNav: 'keyboard navigation between tab elements',
  wave: 'WAVE',
  zIndex: 'z indexes'
};
// Tests that may change the DOM.
const domChangers = new Set([
  'axe', 'focAll', 'focInd', 'focOp', 'hover', 'ibm', 'menuNav', 'wave'
]);
// Browser types available in PlayWright.
const browserTypeNames = {
  'chromium': 'Chrome',
  'webkit': 'Safari',
  'firefox': 'Firefox'
};
// Items that may be waited for.
const waitables = ['url', 'title', 'body'];
// ########## VARIABLES
// Facts about the current session.
let logCount = 0;
let logSize = 0;
let prohibitedCount = 0;
let visitTimeoutCount = 0;
let visitRejectionCount = 0;
let actCount = 0;
// Facts about the current browser.
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
// Validates a batch.
const isValidBatch = batch => {
  // If the batch exists:
  if (batch) {
    // Get its data.
    const {what, hosts} = batch;
    // Return whether the batch is valid:
    return what
      && hosts
      && typeof what === 'string'
      && Array.isArray(hosts)
      && hosts.every(host => host.which && host.what && isURL(host.which));
  }
  // Otherwise, i.e. if the batch does not exist:
  else {
    // Return that it is valid, because it is optional.
    return true;
  }
};
// Validates an initialized reports array.
const isValidReports = reports => Array.isArray(reports) && ! reports.length;
// Validates an initialized log array.
const isValidLog = log => Array.isArray(log) && ! log.length;
// Validates an options object.
const isValidOptions = async options => {
  if (options) {
    const {script, batch, log, reports} = options;
    return isValidScript(script)
    && isValidBatch(batch)
    && isValidLog(log)
    && isValidReports(reports);
  }
  else {
    return false;
  }
};
// ########## OTHER FUNCTIONS
// Closes any existing browser.
const closeBrowser = async () => {
  const browser = browserContext && browserContext.browser();
  if (browser) {
    await browser.close();
  }
};
// Launches a browser.
const launch = async typeName => {
  const browserType = require('playwright')[typeName];
  // If the specified browser type exists:
  if (browserType) {
    // Close any existing browser.
    await closeBrowser();
    // Launch a browser of the specified type.
    const browserOptions = {};
    if (debug) {
      browserOptions.headless = false;
    }
    if (waits) {
      browserOptions.slowMo = waits;
    }
    const browser = await browserType.launch(browserOptions);
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
      // Make its console messages appear in the Playwright console.
      page.on('console', msg => {
        const msgText = msg.text();
        console.log(msgText);
        logCount++;
        logSize += msgText.length;
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
        const {tagName} = element;
        const ownText = ['A', 'BUTTON'].includes(tagName) ? element.textContent : '';
        // HTML link elements have no labels property.
        const labels = tagName !== 'A' ? Array.from(element.labels) : [];
        const labelTexts = labels.map(label => label.textContent);
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
// Returns an element case-insensitively matching a text.
const matchElement = async (page, selector, matchText, index = 0) => {
  // If the page still exists:
  if (page) {
    // Wait 3 seconds until the body contains any text to be matched.
    const slimText = debloat(matchText);
    const bodyText = await page.textContent('body');
    const slimBody = debloat(bodyText);
    const textInBodyJSHandle = await page.waitForFunction(
      args => {
        const matchText = args[0];
        const bodyText = args[1];
        return ! matchText || bodyText.includes(matchText);
      },
      [slimText, slimBody],
      {timeout: 2000}
    )
    .catch(async error => {
      console.log(`ERROR: text to match not in body (${error.message})`);
    });
    // If there is no text to be matched or the body contained it:
    if (textInBodyJSHandle) {
      const lcText = matchText ? matchText.toLowerCase() : '';
      // Identify the selected elements.
      const selections = await page.$$(`body ${selector}`);
      // If there are any:
      if (selections.length) {
        // If there are enough to make a match possible:
        if (index < selections.length) {
          // Return the nth one including any specified text, or the count of candidates if none.
          const elementTexts = [];
          let nth = 0;
          for (const element of selections) {
            const elementText = await textOf(page, element);
            elementTexts.push(elementText);
            if ((! lcText || elementText.includes(lcText)) && nth++ === index) {
              return element;
            }
          }
          return elementTexts;
        }
        // Otherwise, i.e. if there are too few to make a match possible:
        else {
          // Return the count of candidates.
          return selections.length;
        }
      }
      // Otherwise, i.e. if there are no selected elements, return 0.
      else {
        return 0;
      }
    }
    // Otherwise, i.e. if the body did not contain it:
    else {
      // Return the failure.
      return -1;
    }
  }
  // Otherwise, i.e. if the page no longer exists:
  else {
    // Return null.
    console.log('ERROR: Page gone');
    return null;
  }
};
// Returns a string with any final slash removed.
const deSlash = string => string.endsWith('/') ? string.slice(0, -1) : string;
// Tries to visit a URL.
const goto = async (page, url, timeout, waitUntil, isStrict) => {
  const response = await page.goto(url, {
    timeout,
    waitUntil
  })
  .catch(error => {
    console.log(`ERROR: Visit to ${url} timed out before ${waitUntil} (${error.message})`);
    visitTimeoutCount++;
    return 'error';
  });
  if (typeof response !== 'string') {
    const httpStatus = response.status();
    if ([200, 304].includes(httpStatus) || url.startsWith('file:')) {
      const actualURL = page.url();
      if (isStrict && deSlash(actualURL) !== deSlash(url)) {
        console.log(`ERROR: Visit to ${url} redirected to ${actualURL}`);
        return 'redirection';
      }
      else {
        return response;
      }
    }
    else {
      console.log(`ERROR: Visit to ${url} got status ${httpStatus}`);
      visitRejectionCount++;
      return 'error';
    }
  }
  else {
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
            console.log(`ERROR: Visits to ${requestedURL} failed`);
            act.result = `ERROR: Visit to ${requestedURL} failed`;
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
// Adds an error result to an act.
const waitError = (page, act, error, what) => {
  console.log(`ERROR waiting for ${what} (${error.message})`);
  act.result = {url: page.url()};
  act.result.error = `ERROR waiting for ${what}`;
  return false;
};
// Recursively performs the commands in a report.
const doActs = async (report, actIndex, page) => {
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
            // Set the command index to cause a stop.
            actIndex = -2;
          }
          // Otherwise, if there is a numerical jump:
          else if (act.jump) {
            // Set the command index accordingly.
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
      // Otherwise, if it is a score:
      else if (act.type === 'score') {
        // Compute and report the score.
        try {
          const {scorer} = require(`./procs/score/${act.which}`);
          act.result = scorer(report.acts);
        }
        catch (error) {
          act.error = `ERROR: ${error.message}\n${error.stack}`;
        }
      }
      // Otherwise, if a current page exists:
      else if (page) {
        // If the command is a url:
        if (act.type === 'url') {
          // Visit it and wait until it is stable.
          page = await visit(act, page, report.strict);
        }
        // Otherwise, if the act is a wait for text:
        else if (act.type === 'wait') {
          const {what, which} = act;
          console.log(`>> for ${what} to include “${which}”`);
          // Wait 5 seconds for the specified text to appear in the specified place.
          let successJSHandle;
          if (act.what === 'url') {
            successJSHandle = await page.waitForFunction(
              text => document.URL.includes(text), act.which, {timeout: 5000}
            )
            .catch(error => waitError(page, act, error, 'URL'));
          }
          else if (act.what === 'title') {
            successJSHandle = await page.waitForFunction(
              text => document.title.includes(text), act.which, {timeout: 5000}
            )
            .catch(error => waitError(page, act, error, 'title'));
          }
          else if (act.what === 'body') {
            successJSHandle = await page.waitForFunction(
              matchText => {
                const innerText = document.body.innerText;
                return innerText.includes(matchText);
              }, which, {timeout: 5000}
            )
            .catch(error => waitError(page, act, error, 'body'));
          }
          if (successJSHandle) {
            act.result = {url: page.url()};
            if (act.what === 'title') {
              act.result.title = await page.title();
            }
            await page.waitForLoadState('networkidle', {timeout: 10000})
            .catch(error => {
              console.log(`ERROR waiting for stability after ${act.what} (${error.message})`);
              act.result.error = `ERROR waiting for stability after ${act.what}`;
            });
          }
        }
        // Otherwise, if the act is a wait for a state:
        else if (act.type === 'state') {
          // If the state is valid:
          const stateIndex = ['loaded', 'idle'].indexOf(act.which);
          if (stateIndex !== -1) {
            // Wait for it.
            await page.waitForLoadState(
              ['domcontentloaded', 'networkidle'][stateIndex], {timeout: [10000, 5000][stateIndex]}
            )
            .catch(error => {
              console.log(`ERROR waiting for page to be ${act.which} (${error.message})`);
              act.result = `ERROR waiting for page to be ${act.which}`;
            });
          }
          else {
            console.log('ERROR: invalid state');
            act.result = 'ERROR: invalid state';
          }
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
          // If redirection is permitted or did not occur:
          if (! report.strict || deSlash(url) === deSlash(requestedURL)) {
            // Add the URL to the act.
            act.url = url;
            // If the act is a revelation:
            if (act.type === 'reveal') {
              // Make all elements in the page visible.
              await require('./procs/test/allVis').allVis(page);
              act.result = 'All elements visible.';
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
                      // If it was already reached within this command performance:
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
              report.testTimes.push([act.which, Math.round((Date.now() - startTime) / 1000)]);
              report.testTimes.sort((a, b) => b[1] - a[1]);
              // Add the result object (possibly an array) to the act.
              const resultCount = Object.keys(testReport.result).length;
              act.result = resultCount ? testReport.result : 'NONE';
            }
            // Otherwise, if the act is a move:
            else if (moves[act.type]) {
              const selector = typeof moves[act.type] === 'string' ? moves[act.type] : act.what;
              // Identify the element to perform the move on.
              const whichElement = await matchElement(page, selector, act.which || '', act.index);
              // If there were enough candidates but no text match:
              if (Array.isArray(whichElement)) {
                // Add the result to the act.
                act.result = {
                  candidateCount: whichElement.length,
                  error: 'ERROR: no element with matching text found',
                  candidateTexts: whichElement
                };
              }
              // Otherwise, if the body did not contain the text:
              else if (whichElement === -1) {
                // Add the failure to the act.
                act.result = 'ERROR: body did not contain text to match';
              }
              // Otherwise, if there were not enough candidates:
              else if (typeof whichElement === 'number') {
                // Add the failure to the act.
                act.result = {
                  candidateCount: whichElement,
                  error: 'ERROR: too few such elements to allow a match'
                };
              }
              // Otherwise, if a match was found:
              else if (whichElement !== null) {
                // If the move is a button click, perform it.
                if (act.type === 'button') {
                  await whichElement.click({timeout: 3000});
                  act.result = 'clicked';
                }
                // Otherwise, if it is checking a radio button or checkbox, perform it.
                else if (['checkbox', 'radio'].includes(act.type)) {
                  await whichElement.waitForElementState('stable', {timeout: 2000})
                  .catch(error => {
                    console.log(`ERROR waiting for stable ${act.type} (${error.message})`);
                    act.result = `ERROR waiting for stable ${act.type}`;
                  });
                  if (! act.result) {
                    const isEnabled = await whichElement.isEnabled();
                    if (isEnabled) {
                      await whichElement.check({
                        force: true,
                        timeout: 2000
                      })
                      .catch(error => {
                        console.log(`ERROR checking ${act.type} (${error.message})`);
                        act.result = `ERROR checking ${act.type}`;
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
                  await whichElement.focus({timeout: 2000});
                  act.result = 'focused';
                }
                // Otherwise, if it is clicking a link, perform it.
                else if (act.type === 'link') {
                  const href = await whichElement.getAttribute('href');
                  const target = await whichElement.getAttribute('target');
                  await whichElement.click({timeout: 2000});
                  act.result = {
                    href: href || 'NONE',
                    target: target || 'NONE',
                    move: 'clicked'
                  };
                }
                // Otherwise, if it is selecting an option in a select list, perform it.
                else if (act.type === 'select') {
                  await whichElement.selectOption({what: act.what});
                  const optionText = await whichElement.$eval(
                    'option:selected', el => el.textContent
                  );
                  act.result = optionText
                    ? `&ldquo;${optionText}}&rdquo; selected`
                    : 'ERROR: option not found';
                }
                // Otherwise, if it is entering text on the element, perform it.
                else if (act.type === 'text') {
                  await whichElement.type(act.what);
                  report.presses += act.what.length;
                  act.result = 'entered';
                }
                // Otherwise, i.e. if the move is unknown, add the failure to the act.
                else {
                  // Report the error.
                  act.result = 'ERROR: move unknown';
                }
              }
              // Otherwise, i.e. if the page was gone:
              else {
                act.result = 'ERROR: page gone, so matching element not found';
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
            // Otherwise, i.e. if the act type is unknown:
            else {
              // Add the error result to the act.
              act.result = 'ERROR: invalid command type';
            }
          }
          // Otherwise, i.e. if redirection is prohibited but occurred:
          else {
            // Add the error result to the act.
            act.result = `ERROR: Page URL wrong (${url})`;
          }
        }
        // Otherwise, i.e. if the required page URL does not exist:
        else {
          // Add an error result to the act.
          act.result = 'ERROR: Page has no URL';
        }
      }
      // Otherwise, i.e. if no page exists:
      else {
        // Add an error result to the act.
        act.result = 'ERROR: No page identified';
      }
    }
    // Otherwise, i.e. if the command is invalid:
    else {
      // Add an error result to the act.
      act.result = `ERROR: Invalid command of type ${act.type}`;
    }
    // Perform the remaining acts.
    await doActs(report, actIndex + 1, page);
  }
};
// Performs the commands in a script.
const doScript = async (options, report) => {
  // Reinitialize the log statistics.
  logCount = logSize = prohibitedCount = visitTimeoutCount = visitRejectionCount= 0;
  // Add the start time to the report.
  const startTime = new Date();
  report.startTime = startTime.toISOString().slice(0, 19);
  // Add initialized properties to the report.
  report.presses = 0;
  report.amountRead = 0;
  report.testTimes = [];
  // Perform the specified acts.
  await doActs(report, 0, null);
  // Close the browser.
  await closeBrowser();
  // Add the log statistics to the report.
  report.logCount = logCount;
  report.logSize = logSize;
  report.prohibitedCount = prohibitedCount;
  report.visitTimeoutCount = visitTimeoutCount;
  report.visitRejectionCount = visitRejectionCount;
  // If logs are to be scored, do so.
  const scoreTables = report.acts.filter(act => act.type === 'score');
  if (scoreTables.length) {
    const scoreTable = scoreTables[0];
    const {result} = scoreTable;
    if (result) {
      const {logWeights, deficit} = result;
      if (logWeights && deficit) {
        deficit.log = Math.floor(
          logWeights.count * logCount
          + logWeights.size * logSize
          + logWeights.prohibited * prohibitedCount
          + logWeights.visitTimeout * visitTimeoutCount
          + logWeights.visitRejection * visitRejectionCount
        );
        deficit.total += deficit.log;
      }
    }
  }
  // Add the end time and duration to the report.
  const endTime = new Date();
  report.endTime = endTime.toISOString().slice(0, 19);
  report.elapsedSeconds =  Math.floor((endTime - startTime) / 1000);
  // Add the report to the reports array.
  options.reports.push(report);
};
// Recursively performs commands on the hosts of a batch.
const doBatch = async (options, reportTemplate, hostIndex = 0) => {
  const {hosts} = options.batch;
  const host = hosts[hostIndex];
  // If the specified host exists:
  if (host) {
    // Create a report for it.
    const hostReport = JSON.parse(JSON.stringify(reportTemplate));
    // Copy the properties of the specified host to all url acts.
    hostReport.acts.forEach(act => {
      if (act.type === 'url') {
        act.which = host.which;
        act.what = host.what;
      }
    });
    // Perform the commands on the host.
    await doScript(options, hostReport);
    // Add the host’s ID to the host report.
    hostReport.hostName = host.id;
    // Add data from the template to the host report.
    hostReport.orderName = reportTemplate.id;
    hostReport.id = `${hostReport.orderName}-${host.id}`;
    hostReport.orderUserName = reportTemplate.userName;
    hostReport.orderTime = reportTemplate.orderTime;
    hostReport.scriptName = reportTemplate.scriptName;
    hostReport.batchName = reportTemplate.batchName;
    hostReport.scriptIsValid = reportTemplate.scriptIsValid;
    hostReport.batchIsValid = reportTemplate.batchIsValid;
    hostReport.host = host;
    // Process the remaining hosts.
    await doBatch(options, reportTemplate, hostIndex + 1);
  }
};
// Performs a script, with or without a batch.
const doScriptOrBatch = async (options, reportTemplate) => {
  // If there is a batch:
  if (options.batch) {
    // Perform the script on all the hosts in the batch.
    console.log('Starting batch');
    await doBatch(options, reportTemplate);
  }
  // Otherwise, i.e. if there is no batch:
  else {
    // Perform the script.
    console.log('Starting no-batch script');
    await doScript(options, reportTemplate);
  }
  // Add an end time to the log.
  options.log.push({
    event: 'endTime',
    value: ((new Date()).toISOString().slice(0, 19))
  });
};
// Injects url commands into a report where necessary to undo DOM changes.
const injectURLCommands = commands => {
  let injectMore = true;
  while (injectMore) {
    const injectIndex = commands.findIndex((command, index) =>
      index < commands.length - 1
      && command.type === 'test'
      && commands[index + 1].type === 'test'
      && domChangers.has(command.which)
    );
    if (injectIndex === -1) {
      injectMore = false;
    }
    else {
      const lastURL = commands.reduce((url, command, index) => {
        if (command.type === 'url' && index < injectIndex) {
          return command.which;
        }
        else {
          return url;
        }
      }, '');
      commands.splice(injectIndex + 1, 0, {
        type: 'url',
        which: lastURL,
        what: 'URL'
      });
    }
  }
};
// Handles a request.
exports.handleRequest = async options => {
  // If the options object is valid:
  if(isValidOptions(options)) {
    // Add a start time and a timeStamp to the log.
    options.log.push(
      {
        event: 'startTime',
        value: ((new Date()).toISOString().slice(0, 19))
      },
      {
        event: 'timeStamp',
        value: Math.floor((Date.now() - Date.UTC(2022, 1)) / 10000).toString(36)
      }
    );
    // Add the batch size to the log if there is a batch.
    if (options.batch) {
      options.log.push({
        event: 'batchSize',
        value: options.batch.hosts.length
      });
    }
    // Create a report template, containing a copy of the commands as its acts.
    const reportTemplate = {
      host: '',
      acts: JSON.parse(JSON.stringify(options.script.commands))
    };
    // Inject url acts where necessary to undo DOM changes.
    injectURLCommands(reportTemplate.acts);
    // Perform the script, with or without a batch, asynchronously adding to the log and reports.
    await doScriptOrBatch(options, reportTemplate);
  }
  else {
    console.log('ERROR: options missing or invalid');
  }
};
