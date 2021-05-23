/*
  index.js
  autotest main script.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// Module to keep secrets local.
require('dotenv').config();
// Module to create an HTTP server and client.
const http = require('http');
// Module to create an HTTPS server and client.
const https = require('https');
const {injectAxe, getViolations} = require('axe-playwright');
// ########## CONSTANTS
// Set debug to true to add debugging features.
const debug = false;
const protocol = process.env.PROTOCOL || 'https';
// Files servable without modification.
const statics = {
  '/doc.html': 'text/html',
  '/index.html': 'text/html',
  '/style.css': 'text/css'
};
const redirects = {
  '/': '/autotest/index.html'
};
// Pages to be served as error notifications.
const customErrorPageStart = [
  '<html lang="en-US">',
  '  <head>',
  '    <meta charset="utf-8">',
  '    <title>ERROR</title>',
  '  </head>',
  '  <body><main>',
  '    <h1>ERROR</h1>',
  '    <p>__msg__</p>'
];
const systemErrorPageStart = customErrorPageStart.concat(...[
  '    <p>Location:</p>',
  '    <pre>__stack__</pre>'
]);
const errorPageEnd = [
  '  </main></body>',
  '</html>',
  ''
];
const customErrorPage = customErrorPageStart.concat(...errorPageEnd);
const systemErrorPage = systemErrorPageStart.concat(...errorPageEnd);
// CSS selectors for actions.
const moves = {
  text: 'input[type=text',
  radio: 'input[type=radio]',
  checkbox: 'input[type=checkbox]',
  select: 'select',
  button: 'button',
  link: 'a'
};
const testNames = [
  'autocom',
  'imgbg',
  'imgdec',
  'imginf',
  'inlab',
  'labclash',
  'role',
  'roles',
  'simple',
  'state',
  'stylediff'
];
const browserTypeNames = {
  'chromium': 'Chrome',
  'firefox': 'Firefox',
  'webkit': 'Safari'
};
// ########## VARIABLES
let browserContext;
let browserTypeName;
// ########## FUNCTIONS
// Serves a redirection.
const redirect = (url, response) => {
  response.statusCode = 303;
  response.setHeader('Location', url);
  response.end();
};
// Returns whether a string is a URL.
const isURL = textString => /^(?:https?|file):\/\//.test(textString);
// Recursively performs the specified acts.
// Conducts an axe test.
const axe = async (page, rules) => {
  // Inject axe-core into the page.
  await injectAxe(page);
  // Get the data on the elements violating the specified axe-core rules.
  const axeOptions = {};
  if (rules.length) {
    axeOptions.runOnly = rules;
  }
  const axeReport = await getViolations(page, null, {axeOptions});
  // If there are any:
  if (axeReport.length) {
    const report = [];
    // FUNCTION DEFINITIONS START
    // Compacts a check violation.
    const compactCheck = checkObj => {
      return {
        check: checkObj.id,
        description: checkObj.message,
        impact: checkObj.impact
      };
    };
    // Compacts a violating element.
    const compactViolator = elObj => {
      const out = {
        selector: elObj.target[0],
        impact: elObj.impact
      };
      if (elObj.any && elObj.any.length) {
        out['must pass any of'] = elObj.any.map(checkObj => compactCheck(checkObj));
      }
      if (elObj.none && elObj.none.length) {
        out['must pass all of'] = elObj.none.map(checkObj => compactCheck(checkObj));
      }
      return out;
    };
    // Compacts a violated rule.
    const compactRule = (ruleObj) => {
      const out = {
        rule: ruleObj.id,
        description: ruleObj.description,
        impact: ruleObj.impact,
        elements: {}
      };
      if (ruleObj.nodes && ruleObj.nodes.length) {
        out.elements = ruleObj.nodes.map(el => compactViolator(el));
      }
      return out;
    };
    // FUNCTION DEFINITIONS END
    // For each rule violated:
    axeReport.forEach(rule => {
      // Add it to the report.
      report.push(compactRule(rule));
    });
    // Return the report.
    return report;
  }
  // Otherwise, i.e. if there are no violations:
  else {
    // Return a success report.
    return 'NONE';
  }
};
// Conducts all axe tests and return a summary.
const axes = async page => {
  // Count the elements in the page.
  const elementCount = await page.$$eval('*', elements => elements.length);
  // Inject axe-core into the page.
  await injectAxe(page);
  // Get the data on the elements violating axe-core rules.
  const axeReport = await getViolations(page);
  // Define score weights.
  const weights = {
    minor: 1,
    moderate: 2,
    serious: 3,
    critical: 4
  };
  // Initialize a summary.
  const report = {
    elementCount,
    warnings: 0,
    violations: {
      minor: 0,
      moderate: 0,
      serious: 0,
      critical: 0
    },
    score: 0
  };
  // For each rule violated:
  axeReport.forEach(rule => {
    // For each element violating the rule:
    rule.nodes.forEach(element => {
      // Increment the element count of the impact of its violation.
      report.violations[element.impact]++;
      report.score -= weights[element.impact];
    });
  });
  report.score += Math.floor(report.score * 400 / elementCount);
  // Return the report.
  return report;
};
// Launches a browser.
const launch = async typeName => {
  const browserType = require('playwright')[typeName];
  // If the specified browser type exists:
  if (browserType) {
    // Close any existing browser.
    let browser = browserContext && browserContext.browser();
    if (browser) {
      await browser.close();
    }
    // Launch it.
    browser = await browserType.launch(debug ? {headless: false, slowMo: 3000} : {});
    // Create a new context (window) in it.
    browserContext = await browser.newContext();
    // When a page is added to the browser context:
    browserContext.on('page', page => {
      // Make its console messages appear in the Playwright console.
      page.on('console', msg => console.log(msg.text()));
    });
    // Open the first page of the context.
    const page = await browserContext.newPage();
    // Wait until it is stable.
    await page.waitForLoadState('networkidle');
    // Update the name of the current browser type.
    browserTypeName = typeName;
  }
};
// Serves a system error message.
const serveError = (error, response) => {
  if (response.writableEnded) {
    console.log(error.message);
    console.log(error.stack);
  }
  else {
    response.statusCode = 400;
    response.write(
      systemErrorPage
      .join('\n')
      .replace('__msg__', error.message)
      .replace('__stack__', error.stack)
    );
    response.end();
  }
  return '';
};
// Serves a custom error message.
const serveMessage = (msg, response) => {
  if (response.writableEnded) {
    console.log(msg);
  }
  else {
    response.statusCode = 400;
    response.write(customErrorPage.join('\n').replace('__msg__', msg));
    response.end();
  }
  return '';
};
// Serves a page.
const servePage = (content, newURL, mimeType, response) => {
  response.setHeader('Content-Type', mimeType);
  if (newURL) {
    response.setHeader('Content-Location', newURL);
  }
  response.end(content);
};
// Replaces the placeholders in a result page and serves or returns the page.
const render = (path, isServable, which, query, response) => {
  if (! response.writableEnded) {
    // Get the page.
    return fs.readFile(`./${path}/${which}.html`, 'utf8')
    .then(
      // When it arrives:
      page => {
        // Replace its placeholders with eponymous query parameters.
        const renderedPage = page.replace(/__([a-zA-Z]+)__/g, (ph, qp) => query[qp]);
        // If the page is ready to serve:
        if (isServable) {
          // Serve it.
          servePage(renderedPage, `/${path}-out.html`, 'text/html', response);
          return '';
        }
        // Otherwise, i.e. if the page needs modification before it is served:
        else {
          // Return the rendered page.
          return renderedPage;
        }
      },
      error => serveError(new Error(error), response)
    );
  }
};
// Returns the index of an element matching a text, among elements of a type.
const matchIndex = async (page, selector, text) => await page.$eval(
  'body',
  (body, args) => {
    const [selector, text] = args;
    // Identify the elements of the specified type.
    const matches = Array.from(body.querySelectorAll(selector));
    // If there are any:
    if (matches.length) {
      // Return the index of the first one satisfying the text condition, or -1 if none.
      return matches.findIndex(match =>
        match.textContent.includes(text)
        || (
          match.hasAttribute('aria-label')
          && match.getAttribute('aria-label').includes(text)
        )
        || (
          match.labels
          && Array
          .from(match.labels)
          .map(label => label.textContent)
          .join(' ')
          .includes(text)
        )
        || (
          match.hasAttribute('aria-labelledby')
          && match
          .getAttribute('aria-labelledby')
          .split(/\s+/)
          .map(id => document.getElementById(id).textContent)
          .join(' ')
          .includes(text)
        )
        || (
          match.hasAttribute('placeholder')
          && match.getAttribute('placeholder').includes(text)
        )
      );
    }
    // Otherwise, i.e. if there are no elements of the specified type:
    else {
      // Return this.
      return -1;
    }
  },
  [selector, text]
);
// Recursively performs the acts of a script.
const doActs = async (report, actIndex, page) => {
  const {acts} = report;
  // If any acts remain unperformed:
  if (actIndex < acts.length) {
    // Identify the act (an element of report.acts) to be performed.
    const act = acts[actIndex];
    const {type, which, value, index} = act;
    // If the act has the required property:
    if (type) {
      // If the act is a valid launch:
      if (
        type === 'launch'
        && which
        && ['chromium', 'firefox', 'webkit'].includes(which)
      ) {
        // Launch the specified browser, creating a browser context and a page in it.
        await launch(which);
        // Identify its only page as current.
        page = browserContext.pages()[0];
      }
      // Otherwise, if the act is a post-launch act:
      else if (page) {
        // If the act is a valid URL:
        if (type === 'url' && isURL(which)) {
          // Visit it.
          await page.goto(which);
          // Wait until it is stable.
          await page.waitForLoadState('networkidle', {timeout: 10000});
          // Add the resulting URL to the act.
          act.result = page.url();
        }
        // Otherwise, if the act is a valid wait:
        else if (
          type === 'wait'
          && which
          && which.type
          && ['url', 'title', 'body'].includes(which.type)
          && which.text
        ) {
          // Wait for the specified text to appear in the specified place.
          await page.waitForFunction(which => {
            const {type, text} = which;
            const {URL, title, body} = document;
            const success = {
              url: body && URL && URL.includes(text),
              title: body && title && title.includes(text),
              body: body && body.textContent && body.textContent.includes(text)
            };
            return success[type];
          }, which, {timeout: 10000});
          // Add the resulting URL to the act.
          act.result = page.url();
        }
        // Otherwise, if the act is a page switch:
        else if (type === 'page') {
          // Wait for a page to be created and identify it as current.
          page = await browserContext.waitForEvent('page');
          // Wait until it is stable and thus ready for the next act.
          await page.waitForLoadState('networkidle', {timeout: 10000});
          // Add the resulting URL to the act.
          act.result = page.url();
        }
        // Otherwise, i.e. if the act is a test, focus, or move:
        else {
          // Identify the URL of the page.
          const url = page.url();
          // If the page has none:
          if (! isURL(url)) {
            // Add an error result to the act.
            act.result = 'PAGE HAS NO URL';
          }
          // Otherwise, i.e. if the page has a URL:
          else {
            // Add it to the act.
            act.url = url;
            // If the act is a valid custom test:
            if (
              type === 'test' && typeof which === 'string' && which && testNames.includes(which)
            ) {
              // Conduct it.
              const testReport = await require(`./tests/${which}/app`)
              .reporter(page);
              // If the test produced exhibits:
              if (testReport.exhibits) {
                // Add that fact to the act.
                act.exhibits = 'appended';
                // Replace any browser-type placeholder in the exhibits.
                const newExhibits = testReport.exhibits.replace(
                  /__browserTypeName__/g, browserTypeNames[browserTypeName]
                );
                // Append the exhibits to the exhibits in the report.
                if (report.exhibits) {
                  report.exhibits += `\n${newExhibits}`;
                }
                else {
                  report.exhibits = newExhibits;
                }
              }
              // Add the result object (possibly an array) to the act.
              const resultCount = Object.keys(testReport.result).length;
              act.result = resultCount ? testReport.result : 'NONE';
            }
            // Otherwise, if the act is an axe test:
            else if (type === 'axe') {
              // Conduct it and add its result to the act.
              act.result = await axe(page, which);
            }
            // Otherwise, if the act is an axe summary:
            else if (type === 'axes') {
              // Conduct it and add its result to the act.
              act.result = await axes(page);
            }
            // Otherwise, if the act is a valid focus:
            else if (type === 'focus' && which && which.type && moves[which.type]) {
              // Identify the index of the specified element among same-type elements.
              const {type, text} = which;
              const whichIndex = await matchIndex(page, moves[type], text);
              // If it exists:
              if (whichIndex > -1) {
                // Focus it.
                await page.$eval(`:nth-match(${moves[type]}, ${whichIndex + 1})`, async element => {
                  await element.focus();
                });
                // Add a success result to the act.
                act.result = 'focused';
              }
              // Otherwise, i.e. if the element does not exist:
              else {
                // Add a failure result to the act.
                act.result = 'ELEMENT NOT FOUND';
              }
            }
            // Otherwise, if the act is a valid move:
            else if (moves[type] && typeof which === 'string' && which) {
              const selector = moves[type];
              // Identify the index of the specified element among same-type elements.
              const whichIndex= await matchIndex(page, selector, which);
              // If it exists:
              if (whichIndex > -1) {
                // Get its ElementHandle.
                const whichElement = await page.$(`:nth-match(${selector}, ${whichIndex + 1})`);
                // Focus it.
                await whichElement.focus();
                // Perform the act on the element and add a move description to the act.
                if (type === 'text' && typeof value === 'string' && value) {
                  await whichElement.type(value);
                  act.result = 'entered';
                }
                else if (['radio', 'checkbox'].includes(type)) {
                  await whichElement.check();
                  act.result = 'checked';
                }
                else if (type === 'select') {
                  await whichElement.selectOption({index});
                  const optionText = await whichElement.$eval(
                    'option:selected', el => el.textContent
                  );
                  act.result = optionText
                    ? `&ldquo;${optionText}}&rdquo; selected`
                    : 'OPTION NOT FOUND';
                }
                else if (type === 'button') {
                  await whichElement.click();
                  act.result = 'clicked';
                }
                else if (type === 'link') {
                  const href = await whichElement.getAttribute('href');
                  const target = await whichElement.getAttribute('target');
                  await whichElement.click();
                  act.result = {
                    href: href || 'NONE',
                    target: target || 'NONE',
                    move: 'clicked'
                  };
                }
                // Otherwise, i.e. if the specified element was not identified:
                else {
                  // Return an error result.
                  return 'NOT FOUND';
                }
              }
            }
            // Otherwise, i.e. if the act type is unknown:
            else {
              // Add the error result to the act.
              act.result = 'INVALID ACT';
            }
          }
        }
      }
      // Otherwise, i.e. if the act is invalid:
      else {
        // Add an error result to the act.
        act.result = 'NO PAGE IDENTIFIED';
      }
      // Perform the remaining acts.
      await doActs(report, actIndex + 1, page);
    }
  }
};
// Handles a script request.
const scriptHandler = async (scriptName, what, acts, query, response) => {
  const report = {
    scriptName,
    what,
    acts
  };
  // Perform the specified acts and add the results and exhibits to the report.
  await doActs(report, 0, null);
  // If any exhibits have been added to the report, move them to the query.
  if (report.exhibits) {
    query.exhibits = report.exhibits;
    delete report.exhibits;
  }
  // Otherwise, i.e. if no exhibits have been added to the report:
  else {
    // Add an empty exhibit to the query.
    query.exhibits = '<p><strong>None</strong></p>';
  }
  // Convert the report to JSON.
  query.report = JSON.stringify(report, null, 2).replace(/</g, '&lt;');
  // Render and serve the output.
  render('', true, 'out', query, response);
};
// Recursively gets an object of file-name bases and property values from JSON object files.
const getWhats = async (path, baseNames, result) => {
  if (baseNames.length) {
    const firstName = baseNames[0];
    const content = await fs.readFile(`${path}/${firstName}.json`, 'utf8');
    const addition = [firstName, JSON.parse(content).what];
    result.push(addition);
    return await getWhats(path, baseNames.slice(1), result);
  }
  else {
    return Promise.resolve(result);
  }
};
// Handles a request.
const requestHandler = (request, response) => {
  const {method} = request;
  const bodyParts = [];
  request.on('error', err => {
    console.error(err);
  })
  .on('data', chunk => {
    bodyParts.push(chunk);
  })
  // When the request has arrived:
  .on('end', async () => {
    // Identify its WHATWG URL instance.
    let url = new URL(request.url, `${protocol}://${request.headers.host}`);
    // Identify the pathname, with any initial 'autotest/' segment deleted.
    let pathName = url.pathname;
    if (pathName.startsWith('/autotest/')) {
      pathName = pathName.slice(9);
    }
    else if (pathName === '/autotest') {
      pathName = '/';
    }
    const query = {};
    // If the request method is GET:
    if (method === 'GET') {
      // Identify a query object, presupposing no query name occurs twice.
      const searchParams = url.searchParams;
      searchParams.forEach((value, name) => {
        query[name] = value;
      });
      let type = statics[pathName];
      let encoding;
      if (type) {
        encoding = 'utf8';
      }
      else if (pathName.endsWith('.png')) {
        type = 'image/png';
        encoding = null;
      }
      const target = redirects[pathName];
      // If a requestable static file is requested:
      if (type) {
        // Get the file content.
        const content = await fs.readFile(pathName.slice(1), encoding);
        // When it has arrived, serve it.
        servePage(content, pathName, type, response);
      }
      // Otherwise, if the request must be redirected:
      else if (target) {
        // Redirect it.
        redirect(target, response);
      }
      // Otherwise, if the site icon was requested:
      else if (pathName === '/favicon.ico') {
        // Get the file content.
        const content = await fs.readFile('favicon.png');
        // When it has arrived, serve it.
        response.setHeader('Content-Type', 'image/png');
        response.write(content, 'binary');
        response.end();
      }
      // Otherwise, i.e. if the URL is invalid:
      else {
        serveMessage('ERROR: Invalid URL.', response);
      }
    }
    // Otherwise, if the request method is POST:
    else if (method === 'POST') {
      // Get a query string from the request body.
      const queryString = Buffer.concat(bodyParts).toString();
      // Create a query object.
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, name) => {
        query[name] = value;
      });
      const {scriptPath, scriptName} = query;
      // If the path and the request specify a script path:
      if (pathName === '/scriptPath' && scriptPath) {
        // Request an array of the names of the files at the path.
        const fileNames = await fs.readdir(scriptPath);
        // When the array arrives, get an array of script names from it.
        const scriptNames = fileNames
        .filter(name => name.endsWith('.json'))
        .map(name => name.slice(0, -5));
        // If any exist:
        if (scriptNames.length) {
          // Add their count to the query.
          query.scriptSize = scriptNames.length;
          // Get their descriptions.
          const nameWhats = await getWhats(scriptPath, scriptNames, []);
          // When the descriptions arrive, add them as options to the query.
          query.scriptNames = nameWhats.map((pair, index) => {
            const state = index === 0 ? 'selected ' : '';
            return `<option ${state}value="${pair[0]}">${pair[0]}: ${pair[1]}</option>`;
          }).join('\n              ');
          // Render the script-selection page.
          render('', true, 'script', query, response);
        }
        // Otherwise, i.e. if no scripts exist at the specified path:
        else {
          // Serve an error message.
          serveMessage(`ERROR: No scripts at ${scriptPath}.`, response);
        }
      }
      // Otherwise, if the path and the request specify a script:
      else if (pathName === '/scriptName' && scriptPath && scriptName) {
        // Get the content of the script.
        const scriptJSON = await fs.readFile(`${scriptPath}/${scriptName}.json`, 'utf8');
        // When the content arrives, if there is any:
        if (scriptJSON) {
          // Get the script data.
          const script = JSON.parse(scriptJSON);
          const {what, acts} = script;
          // If the script is valid:
          if (
            what
            && acts
            && typeof what === 'string'
            && Array.isArray(acts)
            && acts.length > 1
            && acts[0].type === 'launch'
            && acts[1].type === 'url'
          ) {
            // Process it.
            scriptHandler(scriptName, what, acts, query, response);
          }
          // Otherwise, i.e. if the script is invalid:
          else {
            // Serve an error message.
            serveMessage(`ERROR: Script ${scriptName} invalid.`, response);
          }
        }
        // Otherwise, i.e. if there is no content:
        else {
          // Serve an error message.
          serveMessage(
            `ERROR: No script found in ${scriptPath}/${scriptName}.json.`, response
          );
        }
      }
      // Otherwise, i.e. if the path or the request is invalid:
      else {
        // Serve an error message.
        serveMessage('ERROR: Form submission invalid.', response);
      }
    }
  });
};
// ########## SERVER
const serve = (protocolModule, options) => {
  const server = protocolModule.createServer(options, requestHandler);
  const port = process.env.PORT || '3000';
  server.listen(port, () => {
    console.log(`Server listening at ${protocol}://localhost:${port}.`);
  });
};
if (protocol === 'http') {
  serve(http, {});
}
else if (protocol === 'https') {
  fs.readFile(process.env.KEY)
  .then(
    key => {
      fs.readFile(process.env.CERT)
      .then(
        cert => {
          serve(https, {key, cert});
        },
        error => console.log(error.message)
      );
    },
    error => console.log(error.message)
  );
}
