/*
  index.js
  autotest main script.
*/
const globals = {};
// ########## IMPORTS
// Module to access files.
globals.fs = require('fs').promises;
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
globals.urlStart = `${process.env.PROTOCOL}://${process.env.HOST}`;
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
globals.elementActs = {
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
// ########## FUNCTIONS
// Serves a redirection.
globals.redirect = (url, response) => {
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
  const axeReport = await getViolations(page, null, {
    axeOptions: {
      runOnly: rules
    }
  });
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
  // Otherwise, i.e. if there are no axe-core violations:
  else {
    // Compile and return a report.
    return 'NONE';
  }
};
// Launches a browser.
const launch = async (debug, browserTypeName = 'chromium') => {
  const browserType = require('playwright')[browserTypeName];
  const browser = await browserType.launch(debug ? {headless: false, slowMo: 3000} : {});
  globals.browserContext = await browser.newContext();
  // When a page is added to the browser context:
  globals.browserContext.on('page', page => {
    console.log('A new browser page has opened');
    // Make its console messages appear in the Playwright console.
    page.on('console', msg => console.log(msg.text()));
    /*
    // If a page already is open:
    const pages = globals.browserContext.pages();
    if (pages.length === 2) {
      // Close it.
      pages[0].close();
    }
    */
  });
  // Open the first page.
  const page = await globals.browserContext.newPage();
  // Wait until it is stable.
  await page.waitForLoadState('networkidle');
};
// Serves a system error message.
globals.serveError = (error, response) => {
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
globals.serveMessage = (msg, response) => {
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
globals.servePage = (content, newURL, mimeType, response) => {
  response.setHeader('Content-Type', mimeType);
  if (newURL) {
    response.setHeader('Content-Location', newURL);
  }
  response.end(content);
};
// Replaces the placeholders in a result page and serves or returns the page.
const render = (path, isServable, which = 'out') => {
  if (! globals.response.writableEnded) {
    // Get the page.
    return globals.fs.readFile(`./${path}/${which}.html`, 'utf8')
    .then(
      // When it arrives:
      page => {
        // Replace its placeholders with eponymous query parameters.
        const renderedPage = page.replace(/__([a-zA-Z]+)__/g, (ph, qp) => globals.query[qp]);
        // If the page is ready to serve:
        if (isServable) {
          // Serve it.
          globals.servePage(renderedPage, `/${path}-out.html`, 'text/html', globals.response);
          return '';
        }
        // Otherwise, i.e. if the page needs modification before it is served:
        else {
          // Return the rendered page.
          return renderedPage;
        }
      },
      error => globals.serveError(new Error(error), globals.response)
    );
  }
};
// Recursively gets an object of file-name bases and property values from JSON object files.
const getWhats = async (path, baseNames, result) => {
  if (baseNames.length) {
    const firstName = baseNames[0];
    const content = await globals.fs.readFile(`${path}/${firstName}.json`, 'utf8');
    const addition = [firstName, JSON.parse(content).what];
    result.push(addition);
    return await getWhats(path, baseNames.slice(1), result);
  }
  else {
    return Promise.resolve(result);
  }
};
// Recursively performs the acts of a script.
const doActs = async (report, actIndex) => {
  const {acts} = report;
  // If any acts remain unperformed:
  if (actIndex < acts.length) {
    // Identify the act to be performed.
    const act = acts[actIndex];
    console.log(`Starting to perform act ${actIndex} (${act.type})`);
    // Describe the open pages.
    const pages = globals.browserContext.pages();
    pages.forEach((page, index) => {
      console.log(`Page ${index} has URL ${page.url()}`);
    });
    // If no pages are open:
    if (! pages.length) {
      // Add the result to the act.
      act.result = 'NO PAGE FOUND';
    }
    // Otherwise, i.e. if any pages are open:
    else {
      // Identify the last-opened page as current.
      const page = pages[pages.length - 1];
      console.log(`Current page has URL ${page.url()}`);
      // If the act is a valid custom test:
      if (act.type === 'test' && testNames.includes(act.which)) {
        // Conduct the test and add the result to the act.
        /*
        await globals.browserContext.waitForEvent('page', page => {
          console.log('Before test a page event has fired');
          console.log(`URL of the new page is ${page.url()}`);
        });
        */
        // await page.waitForLoadState('networkidle', {timeout: 10000});
        act.result = await require(`./tests/${act.which}/app`).reporter(page);
      }
      // Otherwise, if it is an axe test:
      else if (act.type === 'axe') {
        // Conduct it and add its result to the act.
        // await page.waitForLoadState('networkidle', {timeout: 10000});
        act.result = await axe(page, act.which);
      }
      // Otherwise, if it is a valid URL:
      else if (act.type === 'url' && isURL(act.which)) {
        // Visit it and add the final URL to the act.
        await page.goto(act.which);
        await page.waitForLoadState('networkidle', {timeout: 10000});
        act.result = page.url();
      }
      // Otherwise, if it is a page switch:
      else if (act.type === 'page') {
        // Wait for a page to be created and identify it.
        const page = await globals.browserContext.waitForEvent('page');
        // Wait until it is stable.
        await page.waitForLoadState('networkidle');
        console.log(`New page ready, at URL ${page.url()}`);
      }
      // Otherwise, if it is a valid element act:
      else if (globals.elementActs[act.type]) {
        const selector = globals.elementActs[act.type];
        // Perform it with a browser function.
        act.result = await page.$eval(
          'body',
          (body, args) => {
            const [act, selector] = args;
            const {type, which, index, value} = act;
            // Identify the specified element, if possible.
            const matches = Array.from(body.querySelectorAll(selector));
            const whichElement = matches.find(match =>
              match.textContent.includes(which)
              || (
                match.hasAttribute('aria-label')
                && match.getAttribute('aria-label').includes(which)
              )
              || (
                match.labels
                && Array
                .from(match.labels)
                .map(label => label.textContent)
                .join(' ')
                .includes(which)
              )
              || (
                match.hasAttribute('aria-labelledby')
                && match
                .getAttribute('aria-labelledby')
                .split(/\s+/)
                .map(id => body.querySelector(`#${id}`).textContent)
                .join(' ')
                .includes(which)
              )
              || (
                match.hasAttribute('placeholder')
                && match.getAttribute('placeholder').includes(which)
              )
            );
            // If one was identified:
            if (whichElement) {
              // Focus it.
              whichElement.focus();
              // Perform the act on the element.
              if (type === 'text') {
                whichElement.value = value;
                whichElement.dispatchEvent(new Event('input'));
                return 'Entered';
              }
              else if (['radio', 'checkbox'].includes(type)) {
                whichElement.checked = true;
                whichElement.dispatchEvent(new Event('change'));
                return 'Checked';
              }
              else if (type === 'select') {
                whichElement.selectedIndex = index;
                whichElement.dispatchEvent(new Event('change'));
                return `<code>${whichElement.item(index).textContent}</code> selected`;

              }
              else if (['button', 'link'].includes(type)) {
                whichElement.click();
                return 'Clicked';
              }
            }
            // Otherwise, i.e. if the specified element was not identified:
            else {
              return 'NOT FOUND';
            }
          },
          [act, selector]
        );
      }
      // Otherwise, i.e. if the act is unknown:
      else {
        act.result = 'INVALID';
      }
      // Perform the remaining actions.
      await doActs(report, actIndex + 1);
    }
  }
};
// Handles a script request.
const scriptHandler = async (scriptName, what, acts, debug) => {
  const report = {
    scriptName,
    what,
    acts
  };
  // Launch Chrome.
  await launch(debug);
  // Add results to the acts of the report.
  await doActs(report, 0);
  // Convert the report to JSON.
  globals.query.report = JSON.stringify(report, null, 2).replace(/</g, '&lt;');
  // Render and serve the output.
  render('', true);
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
  .on('end', () => {
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
    let searchParams = {};
    globals.query = {};
    globals.response = response;
    // If the request method is GET:
    if (method === 'GET') {
      // Identify a query object, presupposing no query name occurs twice.
      searchParams = url.searchParams;
      searchParams.forEach((value, name) => globals.query[name] = value);
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
        globals.fs.readFile(pathName.slice(1), encoding)
        .then(
          // When it has arrived, serve it.
          content => globals.servePage(content, pathName, type, response),
          error => globals.serveError(new Error(error), response)
        );
      }
      // Otherwise, if the request must be redirected:
      else if (target) {
        // Redirect it.
        globals.redirect(target, response);
      }
      // Otherwise, if the site icon was requested:
      else if (pathName === '/favicon.ico') {
        // Get the file content.
        globals.fs.readFile('favicon.png')
        .then(
          // When it has arrived:
          content => {
            // Serve it.
            response.setHeader('Content-Type', 'image/png');
            response.write(content, 'binary');
            response.end();
          },
          error => globals.serveError(new Error(error), response)
        );
      }
      // Otherwise, i.e. if the URL is invalid:
      else {
        globals.serveMessage('ERROR: Invalid URL.', response);
      }
    }
    // Otherwise, if the request method is POST:
    else if (method === 'POST') {
      // Get a query string from the request body.
      const queryString = Buffer.concat(bodyParts).toString();
      // Create a query object.
      searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, name) => globals.query[name] = value);
      const {query} = globals;
      const {scriptPath, scriptName} = query;
      // If the path and the request specify a script path:
      if (pathName === '/scriptPath' && scriptPath) {
        // Request an array of the names of the files at the path.
        globals.fs.readdir(scriptPath)
        .then(
          // When the array arrives:
          fileNames => {
            // Get an array of script names from it.
            const scriptNames = fileNames
            .filter(name => name.endsWith('.json'))
            .map(name => name.slice(0, -5));
            // If any exist:
            if (scriptNames.length) {
              // Add their count to the query.
              query.scriptSize = scriptNames.length;
              // Get their descriptions.              
              getWhats(scriptPath, scriptNames, [])
              .then(
                // When the descriptions arrive:
                nameWhats => {
                  // Add a list of scripts as options to the query.
                  query.scriptNames = nameWhats.map((pair, index) => {
                    const state = index === 0 ? 'selected ' : '';
                    return `<option ${state}value="${pair[0]}">${pair[0]}: ${pair[1]}</option>`;
                  }).join('\n              ');
                  // Render the script-selection page.
                  render('', true, 'script');
                },
                error => globals.serveError(new Error(error), response)
              );
            }
            // Otherwise, i.e. if no scripts exist at the specified path:
            else {
              // Serve an error message.
              globals.serveMessage(`ERROR: No scripts at ${scriptPath}.`, response);
            }
          },
          error => globals.serveError(new Error(error), response)
        );
      }
      // Otherwise, if the path and the request specify a script:
      else if (pathName === '/scriptName' && scriptPath && scriptName) {
        // Get the content of the script.
        globals.fs.readFile(`${scriptPath}/${scriptName}.json`, 'utf8')
        .then(
          // When the content arrives:
          scriptJSON => {
            // If there is any:
            if (scriptJSON) {
              // Get the script data.
              const script = JSON.parse(scriptJSON);
              const {what, acts} = script;
              // If the script is valid:
              if (what && acts && typeof what === 'string' && Array.isArray(acts)) {
                // Process it.
                scriptHandler(scriptName, what, acts, debug);
              }
            }
            // Otherwise, i.e. if there is no content:
            else {
              // Serve an error message.
              globals.serveMessage(
                `ERROR: No script found in ${scriptPath}/${scriptName}.json.`, response
              );
            }
          },
          error => globals.serveError(new Error(error), response)
        );
      }
      // Otherwise, i.e. if the path or the request is invalid:
      else {
        // Serve an error message.
        globals.serveMessage('ERROR: Form submission invalid.', response);
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
  globals.fs.readFile(process.env.KEY)
  .then(
    key => {
      globals.fs.readFile(process.env.CERT)
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
