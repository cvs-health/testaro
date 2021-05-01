// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const debug = true;
    const {chromium} = require('playwright');
    (async () => {
      const ui = await chromium.launch({headless: false, slowMo: 2000});
      const page = await ui.newPage();
      // If debugging is on, output page-script console-log messages.
      if (debug){
        page.on('console', msg => {
          if (msg.type() === 'log') {
            console.log(msg.text());
          }
        });
      }
      // Visit the specified URL.
      await page.goto(query.url);
      // Perform any specified actions.
      if (query.actFile) {
        const actionsJSON = await globals.fs.readFile(`actions/${query.actFile}.json`, 'utf8');
        await page.$eval('body', async (body, actionsJSON) => {
          const actions = JSON.parse(actionsJSON);
          console.log(actions[0].type);
          const input = body.querySelector('input#zip');
          console.log(`Input has tagName ${input.tagName}`);
          input.value = '10069';
          console.log('Entered ZIP');
          input.dispatchEvent(new Event('input'));
          console.log('Dispatched input event');
          body.querySelector('button[type=submit]').click();
          console.log('Clicked button');
          return '';
        }, actionsJSON);
        /*
        await page.$eval('body', async body => {
          const actionsJSON = await globals.fs.readFile(globals.query.actFile, 'utf8');
          const actions = JSON.parse(actionsJSON);
          const input = body.querySelector('input#zip') || actions;
          console.log(`Input has tagName ${input.tagName}`);
          input.value = '10069';
          console.log('Entered ZIP');
          input.dispatchEvent(new Event('input'));
          console.log('Dispatched input event');
          body.querySelector('button[type=submit]').click();
          console.log('Clicked button');
          return '';
        }, globals);
        await page.$eval(
          'body',
          (body, globals) => {
            body.querySelector('input[type=text]').value = globals.urlStart;
            body.querySelector('button').click();
            // return '';
          },
          globals
        );
        await page.$eval(
          'body', (body, globals) => globals.actions(body, globals), globals
        );
        */
      }
      // Get an array of ElementHandles for autocomplete-eligible inputs.
      const inputTypes = ['date', 'email', 'password', 'tel', 'text', 'url'];
      const selectors = inputTypes.map(type => `input[type=${type}]`);
      const elements = await page.$$(selectors.join(', '));
      const tally = [];
      let done = 0;
      // If there are any:
      if (elements.length) {
        // Limit the length of displayed labels.
        const labelTextMax = 100;
        // For each ElementHandle, in parallel in random order:
        elements.forEach(async (element, index) => {
          // Get a concatenation of the text contents of its associated label elements.
          const labelText = await element.evaluate(
            (el, max) => {
              const labelTexts = Array.from(el.labels).map(label => label.textContent);
              if (el.hasAttribute('aria-labelledby')) {
                const byIDs = el.getAttribute('aria-labelledby').split(' ');
                labelTexts.push(byIDs.map(id => document.getElementById(id).textContent));
              }
              if (el.hasAttribute('aria-label')) {
                labelTexts.push(el.getAttribute('aria-label'));
              }
              return labelTexts.join('; ')
              .replace(/[<>]/g, '')
              .replace(/\s{2,}/g, ' ')
              .slice(0, max);
            },
            labelTextMax
          );
          // Get other properties of the element.
          const typeHandle = await element.getProperty('type');
          const type = await typeHandle.jsonValue() || 'text';
          const acHandle = await element.getAttribute('autocomplete') || '';
          const autocomplete = acHandle || 'NONE';
          // Add the element to the result array.
          tally.push({
            index,
            type,
            autocomplete,
            labelText
          });
          // If this element is the last one processed:
          if (++done === elements.length) {
            // Sort the tabulation by DOM order.
            tally.sort((a, b) => a.index - b.index);
            // Convert the tabulation to JSON.
            query.tally = JSON.stringify(tally, null, 2);
            // Render and serve a report.
            globals.render('autocom', true);
          }
        });
      }
      // Otherwise, i.e. if there are no autocomplete-eligible inputs:
      else {
        // Render and serve a report.
        query.tally = 'NONE';
        globals.render('autocom', true);
      }
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
