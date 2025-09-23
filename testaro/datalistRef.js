/*
  © 2025 CVS Health and/or one of its affiliates. All rights reserved.

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
  datalistRef
  Report inputs whose list attribute references a missing or ambiguous datalist
*/

const {init, report} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  const all = await init(100, page, 'input[list]');
  for (const loc of all.allLocs) {
    const isBad = await loc.evaluate(el => {
      const list = el.getAttribute('list');
      if (!list) return false;
      const matches = Array.from(document.querySelectorAll('datalist')).filter(d => d.id === list);
      return matches.length !== 1;
    });
    if (isBad) all.locs.push(loc);
  }
  const whats = [
    'list attribute of the element references an ambiguous or missing datalist element',
    'list attributes of elements reference ambiguous or missing datalist elements'
  ];
  return await report(withItems, all, 'datalistRef', whats, 3, 'INPUT');
};
