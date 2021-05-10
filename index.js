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
globals.urlStart = `${process.env.PROTOCOL}://${process.env.HOST}`;
const protocol = process.env.PROTOCOL || 'https';
// Tests that require additional specifications.
const multiSpec = new Set(['state', 'stylediff']);
// Files servable without modification.
const mimeTypes = {
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
// CSS selectors for preparation actions.
globals.actSelectors = {
  text: 'input[type=text',
  radio: 'input[type=radio]',
  checkbox: 'input[type=checkbox]',
  select: 'select',
  button: 'button',
  link: 'a'
};
// ########## FUNCTIONS
// Recursively performs the specified actions.
const actions = async (acts, page) => {
  // If any actions remain unperformed:
  if (acts.length) {
    // Identify the first unperformed action.
    const act = acts[0];
    // If it is a URL:
    if (act.type === 'url') {
      // Visit it.
      await page.goto(act.which);
      await page.waitForLoadState('networkidle', {timeout: 10000});
    }
    // Otherwise, i.e. if the action is an in-page action:
    else {
      // Perform it with a browser function.
      await page.$eval(
        'body',
        (body, args) => {
          const {type, which, index, value} = args[0];
          const actSelector = args[1][type];
          // Identify the specified element, if possible.
          const typeInstances = Array.from(body.querySelectorAll(actSelector));
          const whichInstance = typeInstances.find(instance =>
            instance.textContent.includes(which)
            || (
              instance.hasAttribute('aria-label')
              && instance.getAttribute('aria-label').includes(which)
            )
            || (
              instance.labels
              && Array
              .from(instance.labels)
              .map(label => label.textContent)
              .join(' ')
              .includes(which)
            )
            || (
              instance.hasAttribute('aria-labelledby')
              && instance
              .getAttribute('aria-labelledby')
              .split(/\s+/)
              .map(id => body.querySelector(`#${id}`).textContent)
              .join(' ')
              .includes(which)
            )
          );
          // If one was identified:
          if (whichInstance) {
            // Focus it.
            whichInstance.focus();
            // Perform the action.
            if (type === 'text') {
              whichInstance.value = value;
              whichInstance.dispatchEvent(new Event('input'));
            }
            else if (['radio', 'checkbox'].includes(type)) {
              whichInstance.checked = true;
              whichInstance.dispatchEvent(new Event('change'));
            }
            else if (type === 'select') {
              whichInstance.selectedIndex = index;
              whichInstance.dispatchEvent(new Event('change'));
            }
            else if (['button', 'link'].includes(type)) {
              whichInstance.click();
            }
          }
        },
        [act, globals.actSelectors]
      );
    }
    // Perform the remaining actions.
    await actions(acts.slice(1), page);
  }
};
// Launches Chrome and gets the specified state of the specified page.
globals.getPageState = async (debug) => {
  const {chromium} = require('playwright');
  const ui = await chromium.launch(debug ? {headless: false, slowMo: 3000} : {});
  const page = await ui.newPage();
  // If debugging is on, output page-script console-log messages.
  if (debug){
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(msg.text());
      }
    });
  }
  const {actFileOrURL} = globals.query;
  // If a URL was specified:
  if (/^(?:https?|file):\/\//.test(actFileOrURL)) {
    // Make it the preparation content.
    globals.query.prep = JSON.stringify({url: actFileOrURL}, null, 2);
    // Visit it.
    await page.goto(actFileOrURL);
  }
  // Otherwise, i.e. if an action file was specified:
  else {
    // Get the file content.
    const actsJSON = await globals.fs.readFile(`actions/${actFileOrURL}.json`, 'utf8');
    // Identify the actions.
    const acts = JSON.parse(actsJSON);
    // Make the file name and the actions the preparation content.
    globals.query.prep = JSON.stringify({
      actFile: actFileOrURL,
      actions: acts
    }, null, 2);
    await actions(acts, page);
  }
  await page.waitForLoadState('networkidle', {timeout: 20000});
  return page;
};
// Gets a report from axe-core.
globals.axe = async (page, rules) => {
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
    // Format the report for output.
    globals.query.axeReport = JSON.stringify(report, null, 2).replace(/</g, '&lt;');
  }
  // Otherwise, i.e. if there are no axe-core violations:
  else {
    // Compile an axe-core report.
    globals.query.axeReport = 'NONE';
  }
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
// Replaces a select-list placeholder.
globals.fillSelect = (string, placeholder, sourceObject, selected) => {
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
// Returns whether each specified query parameter is truthy.
globals.queryIncludes = params => params.every(param => globals.query[param]);
// Replaces the placeholders in a result page and optionally serves the page.
globals.render = (testName, isServable, which = 'out') => {
  if (! globals.response.writableEnded) {
    // Get the page.
    return globals.fs.readFile(`./tests/${testName}/${which}.html`, 'utf8')
    .then(
      // When it arrives:
      page => {
        // Replace its placeholders with eponymous query parameters.
        const renderedPage = page.replace(/__([a-zA-Z]+)__/g, (ph, qp) => globals.query[qp]);
        // If the page is ready to serve:
        if (isServable) {
          // Serve it.
          globals.servePage(renderedPage, `/${testName}-out.html`, 'text/html', globals.response);
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
      let type = mimeTypes[pathName];
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
        globals.fs.readFile('favicon.ico')
        .then(
          // When it has arrived:
          content => {
            // Serve it.
            response.setHeader('Content-Type', 'image/x-icon');
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
      // Identify a query object.
      searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, name) => globals.query[name] = value);
      const test = globals.query.test;
      // If the request provides an initial specification:
      if (pathName === '/testspec') {
        // If additional specifications are required:
        if (multiSpec.has(test)) {
          // Render and serve the test’s specification form.
          globals.render(test, true, 'in');
        }
        // Otherwise, i.e. if the specifications are complete:
        else {
          // Process the submission.
          require(`./tests/${test}/app`).formHandler(globals);
        }
      }
      // Otherwise, if the request provides a final specification:
      else if (multiSpec.has(pathName.replace(/^\/tests\//, ''))) {
        // Process the submission.
        require(`./tests/${test}/app`).formHandler(globals);        
      }
      // Otherwise, i.e. if the request is invalid:
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
