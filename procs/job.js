/*
  © 2024 CVS Health and/or one of its affiliates. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  job
  Utilities about jobs and acts.
*/

// IMPORTS

// Requirements for acts.
const {actSpecs} = require('../actSpecs');
// Module to validate device IDs.
const {isDeviceID} = require('./device');
// Module to get dates from time stamps.
const {dateOf} = require('./dateOf');

// CONSTANTS

// Names and descriptions of tools.
const tools = exports.tools = {
  alfa: 'alfa',
  aslint: 'ASLint',
  axe: 'Axe',
  ed11y: 'Editoria11y',
  htmlcs: 'HTML CodeSniffer WCAG 2.1 AA ruleset',
  ibm: 'IBM Accessibility Checker',
  nuVal: 'Nu Html Checker',
  qualWeb: 'QualWeb',
  testaro: 'Testaro',
  wave: 'WAVE',
};

// FUNCTIONS

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
  else if (type === 'object') {
    return typeof variable === 'object' && ! Array.isArray(variable);
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
    else if (subtype === 'isDeviceID') {
      return isDeviceID(variable);
    }
    else if (subtype === 'isBrowserID') {
      return isBrowserID(variable);
    }
    else if (subtype === 'isFocusable') {
      return isFocusable(variable);
    }
    else if (subtype === 'isTest') {
      return tools[variable];
    }
    else if (subtype === 'isWaitable') {
      return ['url', 'title', 'body'].includes(variable);
    }
    else if (subtype === 'areNumbers') {
      return areNumbers(variable);
    }
    else if (subtype === 'areStrings') {
      return areStrings(variable);
    }
    else if (subtype === 'areArrays') {
      return areArrays(variable);
    }
    else if (subtype === 'isState') {
      return isState(variable);
    }
    else {
      console.log(`ERROR: ${subtype} not a known subtype`);
      return false;
    }
  }
  else {
    return true;
  }
};
// Validates a browser type.
const isBrowserID = type => ['chromium', 'firefox', 'webkit'].includes(type);
// Validates a load state.
const isState = string => ['loaded', 'idle'].includes(string);
// Validates a URL.
const isURL = string => /^(?:https?|file):\/\/[^\s]+$/.test(string);
// Validates a focusable tag name.
const isFocusable = string => ['a', 'button', 'input', 'select'].includes(string);
// Returns whether all elements of an array are numbers.
const areNumbers = array => array.every(element => typeof element === 'number');
// Returns whether all elements of an array are strings.
const areStrings = array => array.every(element => typeof element === 'string');
// Returns whether all properties of an object have array values.
const areArrays = object => Object.values(object).every(value => Array.isArray(value));
// Validates an act by reference to actSpecs.js.
const isValidAct = exports.isValidAct = act => {
  // Identify the type of the act.
  const type = act.type;
  // If the type exists and is known:
  if (type && actSpecs.etc[type]) {
    // Copy the validator of the type for possible expansion.
    const validator = Object.assign({}, actSpecs.etc[type][1]);
    // If the type is test:
    if (type === 'test') {
      // Identify the test.
      const toolName = act.which;
      // If one was specified and is known:
      if (toolName && tools[toolName]) {
        // If it has special properties:
        if (actSpecs.tools[toolName]) {
          // Expand the validator by adding them.
          Object.assign(validator, actSpecs.tools[toolName][1]);
        }
      }
      // Otherwise, i.e. if no or an unknown test was specified:
      else {
        // Return invalidity.
        return false;
      }
    }
    // Return whether the act is valid.
    return Object.keys(validator).every(property => {
      if (property === 'name') {
        return true;
      }
      else {
        const vP = validator[property];
        const aP = act[property];
        // If it is optional and omitted or is present and valid:
        const optAndNone = ! vP[0] && ! aP;
        const isValid = aP !== undefined && hasType(aP, vP[1]) && hasSubtype(aP, vP[2]);
        return optAndNone || isValid;
      }
    });
  }
  // Otherwise, i.e. if the act has an unknown or no type:
  else {
    // Return invalidity.
    return false;
  }
};
// Returns blank if a job is valid, or an error message.
exports.isValidJob = job => {
  // If any job was provided:
  if (job) {
    // Get its properties.
    const {
      id,
      strict,
      isolate,
      standard,
      observe,
      deviceID,
      browserID,
      lowMotion,
      timeLimit,
      creationTimeStamp,
      executionTimeStamp,
      sources,
      acts
    } = job;
    // Return an error for the first missing or invalid property.
    if (! id || typeof id !== 'string') {
      return 'Bad job ID';
    }
    if (typeof strict !== 'boolean') {
      return 'Bad job strict';
    }
    if (typeof isolate !== 'boolean') {
      return 'Bad job isolate';
    }
    if (! ['also', 'only', 'no'].includes(standard)) {
      return 'Bad job standard';
    }
    if (typeof observe !== 'boolean') {
      return 'Bad job observe';
    }
    if (! isDeviceID(deviceID)) {
      return 'Bad job deviceID';
    }
    if (! ['chromium', 'firefox', 'webkit'].includes(browserID)) {
      return 'Bad job browserID';
    }
    if (typeof lowMotion !== 'boolean') {
      return 'Bad job lowMotion';
    }
    if (typeof timeLimit !== 'number' || timeLimit < 1) {
      return 'Bad job timeLimit';
    }
    if (
      ! (creationTimeStamp && typeof creationTimeStamp === 'string' && dateOf(creationTimeStamp))
    ) {
      return 'bad job creationTimeStamp';
    }
    if (
      ! (executionTimeStamp && typeof executionTimeStamp === 'string') && dateOf(executionTimeStamp)
    ) {
      return 'bad job executionTimeStamp';
    }
    if (
      ! sources
      || typeof sources !== 'object'
      || ! ['script', 'batch', 'target'].every(key => sources[key])
      || ! ['what', 'url'].every(key => sources.target[key])
    ) {
      return 'Bad job sources';
    }
    if (
      ! acts
      || ! Array.isArray(acts)
      || acts.length < 2
      || ! acts.every(act => act.type && typeof act.type === 'string')
      || acts[0].type !== 'launch'
    ) {
      return 'Bad job acts';
    }
    const invalidAct = acts.find(act => ! isValidAct(act));
    if (invalidAct) {
      return `Invalid act:\n${JSON.stringify(invalidAct, null, 2)}`;
    }
    return '';
  }
  // Otherwise, i.e. if no job was provided:
  else {
    // Return this.
    return 'no job';
  }
};
