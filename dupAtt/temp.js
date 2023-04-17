/*
  temp.js
*/

const playwright = require('playwright');
const fetch = require('node-fetch');
const fs = require('fs/promises');

const url = `file://${__dirname}/temp.html`;
const scheme = url.replace(/:.+/, '');

// Launch a browser.
playwright.chromium.launch()
.then(browser => {
  // Open a page in it.
  browser.newPage()
  .then(async page => {
    // Navigate to the specified URL.
    await page.goto(url);
    // Show that the page suppresses attribute duplication.
    const element = await page.$('#violator');
    const attVal = await element.getAttribute('width');
    console.log('getAttribute:');
    console.log(attVal);
    // Show that outerHTML suppresses attribute duplication.
    const elHTML = await page.evaluate(() => document.getElementById('violator').outerHTML);
    console.log('outerHTML:');
    console.log(elHTML);
    // Show that Playwright page.content() suppresses attribute duplication.
    const pageContent = await page.content();
    console.log('content():');
    console.log(pageContent);
    browser.close();
    // Get the page content without parsing.
    let rawPage;
    if (scheme === 'file') {
      const filePath = url.slice(7);
      rawPage = await fs.readFile(filePath, 'utf8');
    }
    else {
      rawPage = await fetch(url);
    }
    // Show it.
    console.log('Raw page:');
    console.log(rawPage);
    // Extract from it its elements, in a uniform format.
    const elements = rawPage
    .match(/<[^/<>]+>/g)
    .map(element => element.slice(1, -1).trim().replace(/\s*=\s*/g, '='))
    .map(element => element.replace(/\s+/g, ' '));
    console.log('Elements:');
    console.log(elements.join('\n'));
    // Show those that are duplicate-attribute violators.
    const violators = [];
    elements.forEach(element => {
      const attributes = element.split(' ').slice(1).map(attVal => attVal.replace(/=.+/, ''));
      const attSet = new Set(attributes);
      if (attSet.size < attributes.length) {
        violators.push(element);
      }
    });
    console.log('Violators:');
    console.log(violators.join('\n'));
  });
});
