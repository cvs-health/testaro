/*
  © 2023–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
  ed11y
  This test implements the Editoria11y ruleset for accessibility.
*/

// IMPORTS

// Module to handle files.
const fs = require('fs/promises');
// Module to get the XPath of an element.
const {xPath} = require('playwright-dompath');

// FUNCTIONS

// Conducts and reports the Editoria11y tests.
exports.reporter = async (page, options) => {
  // Get the nonce, if any.
  const {act, report} = options;
  const {jobData} = report;
  const scriptNonce = jobData && jobData.lastScriptNonce;
  // Get the test script.
  const script = await fs.readFile(`${__dirname}/../ed11y/editoria11y.min.js`, 'utf8');
  // Run the tests and get the violating elements and violation facts.
  const resultJSHandle = await page.evaluateHandle(args => new Promise(async resolve => {
    // Impose a timeout on obtaining a result.
    const timer = setTimeout(() => {
      resolve({
        resultObj: {
          prevented: true,
          error: 'ed11y timed out'
        }
      });
    }, 20000);
    const {scriptNonce, script, rulesToTest} = args;
    // When the script has been executed:
    document.addEventListener('ed11yResults', () => {
      // Initialize an array of violating elements and violation facts.
      const reportObj = {
        elements: [],
        resultObj:  {}
      };
      // Populate the global facts.
      const {elements, resultObj} = reportObj;
      [
        'version',
        'options',
        'mediaCount',
        'errorCount',
        'warningCount',
        'dismissedCount',
        'totalCount'
      ]
      .forEach(key => {
        try {
          resultObj[key] = Ed11y[key];
        }
        catch(error) {
          console.log(`ERROR: invalid value of ${key} property of Ed11y (${error.message})`);
        }
      });
      // Get data on violating text alternatives of images from the results.
      resultObj.imageAlts = Ed11y
      .imageAlts
      .filter(item => item[3] !== 'pass')
      .map(item => item.slice(1));
      console.log(`resultObj.imageAlts length initially is ${resultObj.imageAlts.length}`);
      // Delete useless properties from the result.
      delete resultObj.options.sleekTheme;
      delete resultObj.options.darkTheme;
      delete resultObj.options.lightTheme;
      // Initialize the element results.
      const elResults = resultObj.elResults = [];
      // For each rule violation by an element:
      Ed11y.results.forEach(toolResult => {
        // If rules were not selected or they were and include this rule:
        if (! rulesToTest || rulesToTest.includes(toolResult.test)) {
          // Create a record of the violation.
          const elResult = {};
          elResult.test = toolResult.test || '';
          if (toolResult.content) {
            elResult.content = toolResult.content.replace(/\s+/g, ' ');
          }
          const {element} = toolResult;
          if (element.outerHTML) {
            elements.push(element);
            elResult.tagName = element.tagName || '';
            elResult.id = element.id || '';
            elResult.loc = {};
            const locRect = element.getBoundingClientRect();
            if (locRect) {
              ['x', 'y', 'width', 'height'].forEach(dim => {
                elResult.loc[dim] = Math.round(locRect[dim], 0);
              });
            }
            let elText = element.textContent.replace(/\s+/g, ' ').trim();
            if (! elText) {
              elText = element.outerHTML;
            }
            if (elText.length > 400) {
              elText = `${elText.slice(0, 200)}…${elText.slice(-200)}`;
            }
            elResult.excerpt = elText.replace(/\s+/g, ' ');
            elResult.boxID = ['x', 'y', 'width', 'height'].map(dim => elResult.loc[dim]).join(':');
            elResults.push(elResult);
          }
        }
      });
      console.log(`resultObj.imageAlts length is ${reportObj.resultObj.imageAlts.length}`);
      console.log(`resultObj.elResults length is ${reportObj.resultObj.elResults.length}`);
      console.log(`resultObj.elResults is ${JSON.stringify(reportObj.resultObj.elResults, null, 2)}`);
      // Return the result.
      clearTimeout(timer);
      console.log(`About to resolve with reportObj: ${JSON.stringify(reportObj, null, 2)}`);
      resolve(reportObj);
    });
    // Add the test script to the page.
    const testScript = document.createElement('script');
    if (scriptNonce) {
      testScript.nonce = scriptNonce;
      console.log(`Added nonce ${scriptNonce} to script`);
    }
    testScript.textContent = script;
    document.body.insertAdjacentElement('beforeend', testScript);
    // Execute the script.
    try {
      await new Ed11y({
        alertMode: 'headless'
      });
    }
    catch(error) {
      resolve({
        resultObj: {
          prevented: true,
          error: error.message
        }
      });
    };
  }), {scriptNonce, script, rulesToTest: act.rules});
  console.log('Script executed');
  // If the page prevented the tool from performing tests:
  let result;
  const JSHProps = await resultJSHandle.getProperties();
  console.log(JSON.stringify(JSHProps, null, 2));
  const prevented = await resultJSHandle.getProperty('prevented');
  if (prevented) {
    // Populate the result.
    const error = await resultJSHandle.getProperty('error');
    console.log(`Error: ${JSON.stringify(error, null, 2)}`);
    result = {
      prevented,
      error
    };
  }
  // Otherwise, i.e. if the page did not prevent the tool from performing tests:
  else {
    // Get the violating elements.
    const elementsJSHandle = await resultJSHandle.getProperty('elements');
    // If there are any:
    if (elementsJSHandle && elementsJSHandle.length) {
      // Get the results.
      const resultObjJSHandle = await resultJSHandle.getProperty('resultObj');
      const resultJSON = await resultObjJSHandle.jsonValue();
      const result = JSON.parse(resultJSON);
      // For each violating element:
      for (const elIndex in result.elResults) {
        // Get its pathID.
        const elementJSHandle = await elementsJSHandle.getProperty(elIndex);
        const elementHandle = elementJSHandle.asElement();
        const pathID = await xPath(elementHandle);
        // Add it to the element violation record.
        result.elResults[elIndex].pathID = pathID;
      }
    }
  }
  // Populate the tool report data.
  let data = {};
  if (result.prevented) {
    data.success = false;
    data.prevented = true;
    data.error = result.error;
    delete result.prevented;
    delete result.error;
  }
  // Return the act report.
  return {
    data,
    result
  };
};
