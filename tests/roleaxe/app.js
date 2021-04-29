// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['url'])) {
    const {chromium} = require('playwright');
    const {injectAxe, getViolations} = require('axe-playwright');
    (async () => {
      // Identify a Browser.
      const ui = await chromium.launch();
      // Identify a Page (tab).
      const page = await ui.newPage();
      // Navigate to the specified URL.
      await page.goto(query.url);
      // Inject axe-core into the page.
      await injectAxe(page);
      // Get the data on the elements violating the axe-core aria-role rule.
      const axeReport = await getViolations(page, null, {
        axeOptions: {
          runOnly: ['aria-roles']
        }
      });
      // If there are any:
      if (axeReport.length && axeReport[0].nodes && axeReport[0].nodes.length) {
        // Compile an axe-core report.
        const axeNodes = axeReport[0].nodes.map(node => {
          if (
            node.none
            && node.none.length
            && node.none[0].id
            && node.none[0].message
            && node.target
            && node.target.length
            && node.impact
            && node.html
          ) {
            const item = {};
            item.id = node.none[0].id;
            item.selector = node.target[0];
            item.impact = node.impact;
            item.message = node.none[0].message;
            item.html = node.html.trim();
            return item;
          }
          else {
            return {
              status: 'INCOMPLETE'
            };
          }
        });
        query.axeReport = JSON.stringify(axeNodes, null, 2).replace(/</g, '&lt;');
      }
      // Otherwise, i.e. if there are no axe-core violations:
      else {
        // Compile an axe-core report.
        query.axeReport = 'NONE';
      }
      // Identify an array of the ElementHandles of elements with role attributes.
      const elements = await page.$$('[role]');
      const list = [];
      // If any exist:
      if (elements.length) {
        // For each ElementHandle:
        elements.forEach(async (element, index) => {
          // Identify a JSHandle for its type.
          const tagHandle = await element.getProperty('tagName');
          // Identify the upper-case name of the type.
          const ucTag = await tagHandle.jsonValue();
          // Identify its conversion to lower case.
          const tag = ucTag.toLowerCase();
          // Identify the value of its role attribute.
          const role = await element.getAttribute('role');
          // Add the index, type, and role to the list.
          list.push([index, tag, role]);
          // If all matching elements have been processed:
          if (list.length === elements.length) {
            // Sort the list by index.
            list.sort((a, b) => a.index - b.index);
            // Convert it to an array of HTML list elements.
            const htmlList = [];
            list.forEach(item => {
              htmlList.push(
                `<li>
                  ${item[0]}. Element <code>${item[1]}</code> has role <code>${item[2]}</code>.
                </li>`
              );
            });
            // Concatenate the array elements.
            query.report = htmlList.join('\n            ');
            // Render and serve a report.
            globals.render('roleaxe', true);
            ui.close();
          }
        });
      }
      // Otherwise, i.e. if no elements with role attributes exist:
      else {
        // Render and serve a report.
        query.report = '<li>NONE</li>';
        globals.render('roleaxe', true);
      }
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
