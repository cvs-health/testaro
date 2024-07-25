/*
  © 2022–2023 CVS Health and/or one of its affiliates. All rights reserved.

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
  filter
  This test reports elements whose styles include filter. The filter style property is considered
  inherently inaccessible, because it modifies the rendering of content, overriding user settings,
  and requires the user to apply custom styles to neutralize it, which is difficult or impossible
  in some user environments.
*/

// ########## IMPORTS

// Module to perform common operations.
const {simplify} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Specify the rule.
  const ruleData = {
    ruleID: 'filter',
    selector: 'body *',
    pruner: async loc => await loc.evaluate(el => {
      const styleDec = window.getComputedStyle(el);
      return styleDec.filter !== 'none';
    }),
    isDestructive: false,
    complaints: {
      instance: 'Element has a filter style',
      summary: 'Elements have filter styles'
    },
    ordinalSeverity: 2,
    summaryTagName: ''
  };
  // Run the test and return the result.
  return await simplify(page, withItems, ruleData);
};
