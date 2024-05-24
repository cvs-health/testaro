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
  getSource
  Gets and returns the source of a document.
*/

// IMPORTS

// Module to process files.
const fs = require('fs/promises');

// FUNCTIONS

// Gets and returns the source of a page.
exports.getSource = async page => {
  const url = page.url();
  const scheme = url.replace(/:.+/, '');
  const data = {
    prevented: false,
    source: ''
  };
  if (scheme === 'file') {
    const filePath = url.slice(7);
    const rawPage = await fs.readFile(filePath, 'utf8');
    data.source = rawPage;
  }
  else {
    try {
      const rawPageResponse = await fetch(url);
      const rawPage = await rawPageResponse.text();
      data.source = rawPage;
    }
    catch(error) {
      console.log(`ERROR getting source of ${url} (${error.message})`);
      data.prevented = true;
      data.error = `ERROR getting source of ${url}`;
    }
  }
  return data;
};
