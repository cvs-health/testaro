/*
  © 2023 CVS Health and/or one of its affiliates. All rights reserved.

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
  aslint
  Injects and captures results from the ASLint bundle.
  This script is stored as a JavaScript module so that it can be validated before use. The
  tests/aslint module reads it as a text file and inserts it into the page.
*/
const options = {
  asyncRunner: true,
  context: document.documentElement,
  includeElementReference: true,
  reportFormat: {JSON: true},
  watchDomChanges: false
};
window
.aslint
.config(options)
.addListener('onValidatorStarted', function () {
  console.trace('@ Validator started');
})
.addListener('onValidatorComplete', function () {
  console.trace('@ Validator Complete');
})
.addFilter('onBeforeRuleReport', function (report) {
  return report;
})
.setRule('turn-me-off', {isSelectedForScanning: false})
.run()
.then(function (result) {
  const resultEl = document.createElement('pre');
  resultEl.id = 'aslintResult';
  if (result.rules) {
    const ruleIDs = Object.keys(result.rules);
    ruleIDs.forEach(ruleID => {
      const {results} = result.rules[ruleID];
      if (results && results.length) {
        results.forEach(ruleResult => {
          delete ruleResult.data;
          delete ruleResult.element.reference;
          delete ruleResult.message.expected;
          delete ruleResult.skipReason;
          ruleResult.element.html = ruleResult
          .element
          .html
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x3D;/g, '=')
          .replace(/&#x2F;/g, '/')
          .replace(/&#39;/g, '\'')
          .replace(/&amp;(?:amp;)*/g, '&')
          .replace(/%3A/g, ':')
          .replace(/%2F/g, '/');
          ruleResult.message.actual.description = ruleResult
          .message
          .actual
          .description
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x3D;/g, '=')
          .replace(/&#x2F;/g, '/')
          .replace(/&amp;(?:amp;)*/g, '&')
          .replace(/%2F/g, '/');
        });
      }
    });
    ruleIDs.forEach(ruleID => {
      try {
        JSON.stringify(result.rules[ruleID]);
      }
      catch(error) {
        console.trace(`ERROR: Rule ${ruleID} result not stringifiable so its results deleted`);
        delete result.rules[ruleID].results;
        result.rules[ruleID].success = false;
        result.rules[ruleID].error = 'Result property not stringifiable so deleted';
      }
    });
  }
  resultEl.textContent = JSON.stringify(result, null, 2);
  document.body.insertAdjacentElement('beforeend', resultEl);
})
.catch(error => {
  console.error('[ASLint error]', error);
});
