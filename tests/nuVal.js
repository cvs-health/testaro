/*
  nuVal
  This test subjects a page and its source to the Nu Html Checker, thereby testing scripted
  content found only in the loaded page and erroneous content before the browser corrects it.
  The API erratically replaces left and right double quotation marks with invalid UTF-8, which
  appears as 2 or 3 successive instances of the replacement character (U+fffd). Therefore, this
  test removes all such quotation marks and the replacement character. That causes
  'Bad value “” for' to become 'Bad value  for'. Since the corruption of quotation marks is
  erratic, no better solution is known.
*/

// ########## IMPORTS

// Module to make HTTP requests.
const fetch = require('node-fetch');
// Module to process files.
const fs = require('fs/promises');

// ########## FUNCTIONS

exports.reporter = async (page, messages) => {
  // Get the browser-parsed page.
  const pageContent = await page.content();
  // Get the page source.
  const url = page.url();
  const scheme = url.replace(/:.+/, '');
  let rawPage;
  if (scheme === 'file') {
    const filePath = url.slice(7);
    rawPage = await fs.readFile(filePath, 'utf8');
  }
  else {
    try {
      const rawPageResponse = await fetch(url);
      rawPage = await rawPageResponse.text();
    }
    catch(error) {
      console.log(`ERROR getting page for nuVal test (${error.message})`);
      return {result: {
        prevented: true,
        error: 'ERROR getting page for nuVal test'
      }};
    }
  }
  // Get the data from Nu validations.
  const fetchOptions = {
    method: 'post',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'text/html; charset=utf-8'
    }
  };
  // More reliable service than validator.nu.
  const nuURL = 'https://validator.w3.org/nu/?parser=html&out=json';
  const data = {};
  for (const page of [pageContent, rawPage]) {
    try {
      fetchOptions.body = page;
      const nuResult = await fetch(nuURL, fetchOptions);
      const nuResultClean = nuResult.replace(/[\u{fffd}“”]/ug, '');
      const nuReport = await nuResultClean.json();
      // Delete left and right quotation marks and their erratic invalid replacements.
      data[page] = nuReport;
      // If there is a report and restrictions on the report messages were specified:
      if (! data[page].error && messages && Array.isArray(messages) && messages.length) {
        // Remove all messages except those specified.
        const messageSpecs = messages.map(messageSpec => messageSpec.split(':', 2));
        data[page].messages = data[page].messages.filter(message => messageSpecs.some(
          messageSpec => message.type === messageSpec[0]
          && message.message.startsWith(messageSpec[1])
        ));
      }
    }
    catch (error) {
      console.log(`ERROR: nuVal report validation failed (${error.message})`);
      return {result: {
        prevented: true,
        error: 'nuVal report validation failed',
      }};
    }
  }
  return {result: data};
};
