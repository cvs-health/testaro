/*
  index.js
  testaro main script.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs/promises');
// Module to create an HTTPS server and client.
const https = require('https');
// Requirements for commands.
const {commands} = require('./commands');
// ########## CONSTANTS
// Set DEBUG environment variable to 'true' to add debugging features.
const debug = process.env.DEBUG === 'true';
// Set WAITS environment variable to a positive number to insert delays (in ms).
const waits = Number.parseInt(process.env.WAITS) || 0;
const protocol = 'https';
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
  autocom: 'autocomplete attributes of inputs',
  axe: 'Axe',
  bodyText: 'text content of the page body',
  bulk: 'count of visible elements',
  embAc: 'active elements embedded in links or buttons',
  focAll: 'focusable and Tab-focused elements',
  focInd: 'focus indicators',
  focOp: 'focusability and operability',
  hover: 'hover-caused content additions',
  ibm: 'IBM Accessibility Checker',
  imgAlt: 'alt attributes of img elements',
  imgBg: 'background images and their texts',
  imgDec: 'decorative images and their texts',
  imgInf: 'informative images and their texts',
  inLab: 'input labels',
  labClash: 'labeling inconsistencies',
  linkUl: 'inline-link underlining',
  menuNav: 'keyboard navigation between focusable menu items',
  motion: 'motion',
  radioSet: 'fieldset grouping of radio buttons',
  roleList: 'role attributes',
  role: 'roles',
  simple: 'nothing',
  state: 'focus and hover states',
  styleDiff: 'style inconsistencies',
  tabNav: 'keyboard navigation between tab elements',
  tblAc: 'active elements contained by tables',
  visibles: 'visible elements',
  wave: 'WAVE',
  zIndex: 'z indexes'
};
// Tests that may change the DOM.
const domChangers = new Set([
  'axe', 'focAll', 'focInd', 'focOp', 'hover', 'ibm', 'menuNav', 'state', 'wave'
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
// ########## FUNCTIONS
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
// Serves a system error message.
const serveError = error => {
  console.log(error.message);
  console.log(error.stack);
};
// Serves a custom error message.
const serveMessage = msg => {
  console.log(msg);
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
const isValidScript = (scriptJSON, isValidator) => {
  // Get the script data.
  const script = JSON.parse(scriptJSON);
  const {what, strict, commands} = script;
  // Return whether the script is valid:
  return what
    && typeof strict === 'boolean'
    && isValidator ? strict : true
    && commands
    && typeof what === 'string'
    && Array.isArray(commands)
    && commands[0].type === 'launch'
    && commands.length > 1
    && commands[1].type === 'url'
    && isURL(commands[1].which);
};
// Validates a batch.
const isValidBatch = batchJSON => {
  // Get the batch data.
  const batch = JSON.parse(batchJSON);
  const batchWhat = batch.what;
  const {hosts} = batch;
  // Return whether the batch is valid:
  return batchWhat
    && hosts
    && typeof batchWhat === 'string'
    && Array.isArray(hosts)
    && hosts.every(host => host.which && host.what && isURL(host.which));
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
// Updates a report file.
const reportFileUpdate = async (reportDir, nameSuffix, report, isJSON) => {
  const fileReport = isJSON ? report : JSON.stringify(report, null, 2);
  await fs.writeFile(`${reportDir}/report-${nameSuffix}.json`, fileReport);
};
// Returns a property value and whether it satisfies a condition.
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
// Recursively performs the commands in a report.
const doActs = async (acts, report, actIndex, page, reportSuffix, reportDir) => {
  // If any more commands are to be performed:
  if (actIndex > -1 && actIndex < acts.length) {
    // Identify the command to be performed.
    const scriptAct = acts[actIndex];
    const act = JSON.parse(JSON.stringify(scriptAct));
    // If it is valid:
    if (isValidCommand(act)) {
      const whichSuffix = act.which ? ` (${act.which})` : '';
      console.log(`>>>> ${act.type}${whichSuffix}`);
      // Copy it into the report.
      report.acts.push(act);
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
          const waitError = (error, what) => {
            console.log(`ERROR waiting for ${what} (${error.message})`);
            act.result = {url: page.url()};
            act.result.error = `ERROR waiting for ${what}`;
            return false;
          };
          // Wait 5 seconds for the specified text to appear in the specified place.
          let successJSHandle;
          if (act.what === 'url') {
            successJSHandle = await page.waitForFunction(
              text => document.URL.includes(text), act.which, {timeout: 5000}
            )
            .catch(error => waitError(error, 'URL'));
          }
          else if (act.what === 'title') {
            successJSHandle = await page.waitForFunction(
              text => document.title.includes(text), act.which, {timeout: 5000}
            )
            .catch(error => waitError(error, 'title'));
          }
          else if (act.what === 'body') {
            successJSHandle = await page.waitForFunction(
              matchText => {
                const innerText = document.body.innerText;
                return innerText.includes(matchText);
              }, which, {timeout: 5000}
            )
            .catch(error => waitError(error, 'body'));
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
                console.log(`> failure count: ${failureCount}`);
              }
              report.testTimes.push([act.which, Math.round((Date.now() - startTime) / 1000)]);
              report.testTimes.sort((a, b) => b[1] - a[1]);
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
                  // Return an error result.
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
    // Update the report file.
    await reportFileUpdate(reportDir, reportSuffix, report, false);
    // Perform the remaining acts.
    await doActs(acts, report, actIndex + 1, page, reportSuffix, reportDir);
  }
  // Otherwise, i.e. if no more acts are to be performed:
  else {
    // Return a Promise.
    return Promise.resolve('');
  }
};
// Handles a script request.
const scriptHandler = async (what, strict, options, hostIndex) => {
  // Reinitialize the log statistics.
  logCount = logSize = prohibitedCount = visitTimeoutCount = visitRejectionCount= 0;
  // Initialize a script report.
  const report = {};
  report.script = query.scriptName;
  report.batch = query.batchName;
  report.what = what;
  report.strict = strict;
  report.testDate = new Date().toISOString().slice(0, 10);
  report.timeStamp = query.timeStamp;
  report.logCount = 0;
  report.logSize = 0;
  report.prohibitedCount = 0;
  report.visitTimeoutCount = 0;
  report.visitRejectionCount = 0;
  report.presses = 0;
  report.amountRead = 0;
  report.acts = [];
  report.testTimes = [];
  const hostSuffix = hostIndex > -1 ? `-${hostIndex.toString().padStart(3, '0')}` : '';
  const reportSuffix = `${query.timeStamp}${hostSuffix}`;
  // Perform the specified acts and add the results and exhibits to the report.
  await doActs(acts, report, 0, null, reportSuffix, query.reportDir);
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
  // If any exhibits have been added to the report, move them to the query.
  if (report.exhibits) {
    query.exhibits = report.exhibits;
    delete report.exhibits;
  }
  // Otherwise, i.e. if no exhibits have been added to the report:
  else {
    // Add properties to the query.
    query.exhibits = '<p><strong>None</strong></p>';
    query.hostIndex = hostIndex;
  }
  // Convert the report to JSON and add it to the query.
  const reportJSON = JSON.stringify(report, null, 2);
  query.report = reportJSON.replace(/</g, '&lt;');
  // Update the report file.
  await reportFileUpdate(query.reportDir, reportSuffix, reportJSON, true);
  // Write the output.
  console.log(query);
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
      commands.splice(injectIndex + 1, 0, {
        type: 'url',
        which: 'https://*',
        what: 'URL'
      });
    }
  }
};
// Recursively performs commands on the hosts of a batch.
const doBatch = async (commands, hosts, hostIndex) => {
  if (hosts.length) {
    // Identify the first host.
    const firstHost = hosts[0];
    // Copy the commands for the first host.
    const acts = JSON.parse(JSON.stringify(commands));
    // Replace all hosts in the acts with the first host.
    acts.forEach(act => {
      if (act.type === 'url') {
        act.which = firstHost.which;
        act.what = firstHost.what;
      }
    });
    // Perform the commands on the host.
    await scriptHandler(what, strict, options, hostIndex);
    // Process the remaining hosts.
    await doBatch(commands, hosts.slice(1), hostIndex + 1);
  }
};
// Handles a request.
const requestHandler = options => {
  // If the options object is valid:
  if (isValidOptions) {
    // Initialize the JSON report.
    const report = {options};
    // Add a timeStamp.
    report.timeStamp = Math.floor((Date.now() - Date.UTC(2021, 4)) / 10000).toString(36);
    const {commands} = options.script;
    // Inject url commands where necessary to undo DOM changes.
    injectURLCommands(commands);
    // If there is a batch:
    if (options.withBatch) {
      const {hosts} = options.withBatch.batch;
      // Perform the script on all the hosts in the batch.
      doBatch(options, 0);
    }
    // Otherwise, i.e. if there is no batch:
    else {
      // Perform the script.
      doScript(options, -1);
    }
    // If there is no batch:
    if (batchName === 'None') {
    }
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
                if (isValidBatch) {
                  // Inject url commands where necessary to undo DOM changes.
                  injectURLCommands(commands);
                  // FUNCTION DEFINITION START
                  // Recursively process commands on the hosts of a batch.
                  const doBatch = async (hosts, isFirst, hostIndex) => {
                    if (hosts.length) {
                      // Identify the first host.
                      const firstHost = hosts[0];
                      console.log(`>>>>>> ${firstHost.what}`);
                      // Replace all hosts in the script with it.
                      commands.forEach(command => {
                        if (command.type === 'url') {
                          command.which = firstHost.which;
                          command.what = firstHost.what;
                        }
                      });
                      // Identify the stage of the host.
                      let stage = 'more';
                      if (isFirst) {
                        stage = hosts.length > 1 ? 'start' : 'all';
                      }
                      else {
                        stage = hosts.length > 1 ? 'more' : 'end';
                      }
                      // Initialize an array of the acts as a copy of the commands.
                      const acts = JSON.parse(JSON.stringify(commands));
                      // Process the commands on the host.
                      await scriptHandler(what, strict, acts, options, hostIndex);
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
                  serveMessage(`ERROR: Batch ${batchName} invalid`, response);
                }
              }
              // Otherwise, i.e. if the batch has no content:
              else {
                // Serve an error message.
                serveMessage(`ERROR: Batch ${batchName} empty`, response);
              }
            }
          }
          // Otherwise, i.e. if the script is invalid:
          else {
            // Serve an error message.
            serveMessage(`ERROR: Script ${scriptName} invalid`, response);
          }
        }
        // Otherwise, i.e. if the script has no content:
        else {
          // Serve an error message.
          serveMessage(`ERROR: Script ${scriptName} empty`, response);
        }
      }
      // Otherwise, if the request submitted the validate form:
      else if (pathName === '/validate' && options.validatorName && options.reportDir) {
        const {validatorName} = options;
        // Get the content of the validator script.
        const scriptJSON = await fs.readFile(`validation/scripts/${validatorName}.json`, 'utf8');
        // When the content arrives, if there is any:
        if (scriptJSON) {
          // Get the script data.
          const script = JSON.parse(scriptJSON);
          const {what, strict, commands} = script;
          // If the validator is valid:
          if (isValidScript(scriptJSON, true) {
            console.log(`>>>>>>>> ${validatorName}: ${what}`);
            // Process it, using the commands as the initial acts.
            scriptHandler(what, strict, commands, options, 'all', -1, response);
          }
          // Otherwise, i.e. if the validator is invalid:
          else {
            // Serve an error message.
            serveMessage(`ERROR: Validator script ${validatorName} invalid`, response);
          }
        }
        // Otherwise, i.e. if the validator has no content:
        else {
          // Serve an error message.
          serveMessage(`ERROR: Validator script ${validatorName} empty`, response);
        }
      }
      // Otherwise, i.e. if the request is invalid:
      else {
        // Serve an error message.
        serveMessage('ERROR: Form submission invalid', response);
      }
    }
  });
};
// ########## SERVER
const serve = (protocolModule, options) => {
  const server = protocolModule.createServer(options, requestHandler);
  const host = process.env.HOST || 'localhost';
  // Choose the port specified by the argument or the .env file.
  const port = process.argv[2] || process.env.PORT || '3000';
  server.listen(port, () => {
    console.log(`Server listening at ${protocol}://${host}:${port}.`);
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
