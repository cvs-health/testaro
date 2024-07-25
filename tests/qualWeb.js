/*
  © 2023–2024 CVS Health and/or one of its affiliates. All rights reserved.

  MIT License

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
  qualWeb
  This test implements the QualWeb ruleset for accessibility.
*/

// IMPORTS

const {QualWeb} = require('@qualweb/core');
const {doBy} = require('../procs/job');

// CONSTANTS

const qualWeb = new QualWeb({});
const clusterOptions = {
  timeout: 25 * 1000
};

// FUNCTIONS

// Conducts and reports the QualWeb tests.
exports.reporter = async (page, report, actIndex, timeLimit) => {
  const act = report.acts[actIndex];
  const {withNewContent, rules} = act;
  const data = {};
  let result = {};
  // Start the QualWeb core engine.
  await qualWeb.start(clusterOptions);
  // Specify the invariant test options.
  const qualWebOptions = {
    log: {
      console: true
    },
    crawlOptions: {
      maxDepth: 0,
      maxUrls: 1,
      timeout: 25 * 1000,
      maxParallelCrawls: 1,
      logging: true
    },
    execute: {
      counter: true
    }
  };
  // Specify a URL or provide the content.
  try {
    if (withNewContent) {
      qualWebOptions.url = page.url();
    }
    else {
      qualWebOptions.html = await page.content();
    }
    // Specify which rules to test for.
    const actSpec = rules ? rules.find(typeRules => typeRules.startsWith('act:')) : null;
    const wcagSpec = rules ? rules.find(typeRules => typeRules.startsWith('wcag:')) : null;
    const bestSpec = rules ? rules.find(typeRules => typeRules.startsWith('best:')) : null;
    if (actSpec) {
      if (actSpec === 'act:') {
        qualWebOptions.execute.act = false;
      }
      else {
        const actRules = actSpec.slice(4).split(',').map(num => `QW-ACT-R${num}`);
        qualWebOptions['act-rules'] = {rules: actRules};
        qualWebOptions.execute.act = true;
      }
    }
    else {
      qualWebOptions['act-rules'] = {
        levels: ['A', 'AA', 'AAA'],
        principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
      };
      qualWebOptions.execute.act = true;
    }
    if (wcagSpec) {
      if (wcagSpec === 'wcag:') {
        qualWebOptions.execute.wcag = false;
      }
      else {
        const wcagTechniques = wcagSpec.slice(5).split(',').map(num => `QW-WCAG-T${num}`);
        qualWebOptions['wcag-techniques'] = {techniques: wcagTechniques};
        qualWebOptions.execute.wcag = true;
      }
    }
    else {
      qualWebOptions['wcag-techniques'] = {
        levels: ['A', 'AA', 'AAA'],
        principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
      };
      qualWebOptions.execute.wcag = true;
    }
    if (bestSpec) {
      if (bestSpec === 'best:') {
        qualWebOptions.execute.bp = false;
      }
      else {
        const bestPractices = bestSpec.slice(5).split(',').map(num => `QW-BP${num}`);
        qualWebOptions['best-practices'] = {bestPractices};
        qualWebOptions.execute.bp = true;
      }
    }
    else {
      qualWebOptions['best-practices'] = {};
      qualWebOptions.execute.bp = true;
    }
    // Get the report.
    let actReports = await doBy(timeLimit, qualWeb, 'evaluate', [qualWebOptions], 'qualWeb testing');
    // If the testing finished on time:
    if (actReports !== 'timedOut') {
      result = actReports[withNewContent ? qualWebOptions.url : 'customHtml'];
      // If it contains a copy of the DOM:
      if (result && result.system && result.system.page && result.system.page.dom) {
        // Delete the copy.
        delete result.system.page.dom;
        const {modules} = result;
        // If the report contains a modules property:
        if (modules) {
          // For each test section in it:
          for (const section of ['act-rules', 'wcag-techniques', 'best-practices']) {
            // If testing in the section was specified:
            if (qualWebOptions[section]) {
              // If the section exists:
              if (modules[section]) {
                const {assertions} = modules[section];
                // If it contains assertions (test results):
                if (assertions) {
                  const ruleIDs = Object.keys(assertions);
                  // For each rule:
                  ruleIDs.forEach(ruleID => {
                    const ruleAssertions = assertions[ruleID];
                    const {metadata} = ruleAssertions;
                    // If result data exist for the rule:
                    if (metadata) {
                      // If there were no warnings or failures:
                      if (metadata.warning === 0 && metadata.failed === 0) {
                        // Delete the rule data.
                        delete assertions[ruleID];
                      }
                      // Otherwise, i.e. if there was at least 1 warning or failure:
                      else {
                        if (ruleAssertions.results) {
                          ruleAssertions.results = ruleAssertions.results.filter(
                            raResult => raResult.verdict !== 'passed'
                          );
                        }
                      }
                    }
                    // Shorten long HTML codes of elements.
                    const {results} = ruleAssertions;
                    results.forEach(raResult => {
                      const {elements} = raResult;
                      if (elements && elements.length) {
                        elements.forEach(element => {
                          if (element.htmlCode && element.htmlCode.length > 700) {
                            element.htmlCode = `${element.htmlCode.slice(0, 700)} …`;
                          }
                        });
                      }
                    });
                  });
                }
                else {
                  data.prevented = true;
                  data.error = 'ERROR: No assertions';
                }
              }
              else {
                data.prevented = true;
                data.error = `ERROR: No ${section} section`;
              }
            }
          }
        }
        else {
          data.prevented = true;
          data.error = 'ERROR: No modules';
        }
      }
      else {
        data.prevented = true;
        data.error = 'ERROR: No DOM';
      }
      // Stop the QualWeb core engine.
      await qualWeb.stop();
      // Test whether the result is an object.
      try {
        JSON.stringify(result);
      }
      catch(error) {
        const message = `ERROR: qualWeb result cannot be made JSON (${error.message})`;
        data.prevented = true;
        data.error = message;
      };
    }
  }
  catch(error) {
    const message = error.message.slice(0, 200);
    data.prevented = true;
    data.error = message;
    result = {
      prevented: true,
      error: message
    };
  };
  return {
    data,
    result
  };
};
