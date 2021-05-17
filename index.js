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
  'state',
  'stylediff'
];
// ########## FUNCTIONS
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
    return '<strong>None</strong>';
  }
};
// Launches a browser and returns a new page.
const launch = async (debug, browserType = 'chromium') => {
  const browser = require('playwright')[browserType];
  const ui = await browser.launch(debug ? {headless: false, slowMo: 3000} : {});
  const page = await ui.newPage();
  // If debugging is on, output page-script console-log messages.
  if (debug){
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(msg.text());
      }
    });
  }
  return page;
};
// Launches Chrome and gets the specified state of the specified page.
/*
const getTestPage = async (debug, browserType = 'chromium') => {
  const page = await launch(debug, browserType);
  const {actFileOrURL} = globals.query;
  // If a URL was specified:
  if (isURL(actFileOrURL)) {
    // Make it the preparation content.
    globals.query.prep = JSON.stringify({url: actFileOrURL}, null, 2);
    // Visit it.
    await page.goto(actFileOrURL);
  }
  // Otherwise, i.e. if an action file was specified:
  else {
    // Get the file content.
    const actsJSON = await globals.fs.readFile(`scripts/one/${actFileOrURL}.json`, 'utf8');
    // Identify the actions.
    const acts = JSON.parse(actsJSON);
    // Make the file name and the actions the preparation content.
    globals.query.prep = JSON.stringify({
      actFile: actFileOrURL,
      actions: acts
    }, null, 2);
    // Perform the actions.
    await doTestPreps(acts, page);
  }
  await page.waitForLoadState('networkidle', {timeout: 20000});
  return page;
};
*/
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
// Replaces a select-list placeholder.
const fillSelect = (string, placeholder, sourceObject, selected) => {
  return string.replace(
    new RegExp(`( *)${placeholder}`),
    Object
    .keys(sourceObject)
    .map(
      key => {
        const selAttr = key === selected ? 'selected ' : '';
        const replacement = sourceObject[key].name || sourceObject[key];
        return `$1<option ${selAttr}value="${key}">${replacement}</option>`;
      }
    )
    .join('\n')
  );
};
// Serves a page.
globals.servePage = (content, newURL, mimeType, response) => {
  response.setHeader('Content-Type', mimeType);
  if (newURL) {
    response.setHeader('Content-Location', newURL);
  }
  response.end(content);
};
/*
// Returns whether each specified query parameter is truthy.
const queryIncludes = params => params.every(param => globals.query[param]);
*/
// Replaces the placeholders in a result page and optionally serves the page.
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
// Serves a redirection.
globals.redirect = (url, response) => {
  response.statusCode = 303;
  response.setHeader('Location', url);
  response.end();
};
/*
// Handles a test request.
const testHandler = (args, axeRules, testName) => {
  if (queryIncludes(args)) {
    const debug = false;
    (async () => {
      // Perform the specified actions in Chrome.
      const page = await getTestPage(debug);
      // Compile an axe-core report, if specified.
      if (axeRules.length) {
        await axe(page, axeRules);
      }
      // Compile the specified report.
      const report = await require(`./tests/one/${testName}/app`)
      .reporter(page, globals.query, getTestPage);
      const noText = '<strong>None</strong>';
      const data = report.data;
      const dataLength = Array.isArray(data) ? data.length : Object.keys(data).length;
      globals.query.report = report.json
        ? dataLength ? JSON.stringify(data, null, 2) : noText
        : dataLength ? data.join('\n            ') : `<li>${noText}</li>`;
      // Render and serve a report.
      render(`tests/one/${testName}`, true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
*/
// Retursively gets an object of file-name bases and property values from JSON object files.
const getProps = async (obj, path, baseNames, propName) => {
  if (baseNames.length) {
    const firstName = baseNames[0];
    const content = await globals.fs.readFile(`${path}/${firstName}.json`, 'utf8');
    obj[firstName][propName] = JSON.parse(content)[propName];
    await getProps(obj, path, baseNames.slice(1), propName);
  }
  else {
    return Promise.resolve('');
  }
};
// Recursively performs the acts of a script.
const doActs = async (acts, page, report) => {
  // If any acts remain unperformed:
  if (acts.length) {
    // Identify the first unperformed act.
    const act = acts[0];
    // If it is a valid custom test:
    if (act.type === 'test' && testNames.includes(act.which)) {
      // Conduct the test and add the result to the act.
      act.result = await require(`./tests/${act.which}`).reporter(page);
    }
    // Otherwise, if it is an axe test:
    else if (act.type === 'axe') {
      // Conduct it and add its result to the act.
      act.result = await axe(page, act.which);
    }
    // Otherwise, if it is a valid URL:
    else if (act.type === 'url' && isURL(act.which)) {
      // Visit it and add the final URL to the act.
      await page.goto(act.which);
      await page.waitForLoadState('networkidle', {timeout: 10000});
      act.result = page.url();
    }
    // Otherwise, if it is a valid element act:
    else if (globals.elementActs[act.type]) {
      // Perform it with a browser function.
      await page.$eval(
        'body',
        (body, args) => {
          const {type, which, index, value} = args[0];
          const selector = args[1][type];
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
          );
          // If one was identified:
          if (whichElement) {
            // Focus it.
            whichElement.focus();
            // Perform the act.
            if (type === 'text') {
              whichElement.value = value;
              whichElement.dispatchEvent(new Event('input'));
            }
            else if (['radio', 'checkbox'].includes(type)) {
              whichElement.checked = true;
              whichElement.dispatchEvent(new Event('change'));
            }
            else if (type === 'select') {
              whichElement.selectedIndex = index;
              whichElement.dispatchEvent(new Event('change'));
            }
            else if (['button', 'link'].includes(type)) {
              whichElement.click();
            }
          }
        },
        [act, globals.elementActs]
      );
    }
    // Otherwise, i.e. if the act is unknown:
    else {
      act.result = 'INVALID';
    }
    // Add the act to the report.
    report.acts.push(act);
    // Perform the remaining actions.
    await doActs(acts.slice(1), page);
  }
};
// Handles a script request.
const scriptHandler = async (scriptName, what, acts, debug) => {
  const report = {
    scriptName,
    what,
    acts
  };
  const page = await launch(debug, 'chromium');
  report.result = await doActs(acts, page, report);
  globals.query.report = JSON.stringify(report.replace(/</g, '&lt;'), null, 2);
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
            .filter(name => name.endsWith('.json')
            .map(name => name.slice(-5)));
            // If any exist:
            if (scriptNames.length) {
              // Create an object of script-name data.
              const scriptNamesObj = {};
              getProps(scriptNamesObj, scriptPath, scriptNames, 'what')
              .then(
                () => {
                  // Request the script-selection page.
                  render('', false, 'script')
                  .then(
                    // When it arrives:
                    scriptPage => {
                      // Replace its select-list placeholder.
                      const newPage = fillSelect(
                        scriptPage, '__scriptNames__', scriptNamesObj, scriptNames[0]
                      );
                      globals.servePage(
                        newPage, '/autotest/script.html', 'text/html', response
                      );
                    },
                    error => globals.serveError(new Error(error), response)
                  );
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
