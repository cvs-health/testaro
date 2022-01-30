/*
  tester
  Executes the application for testing.
*/
const options = {
  script: {
    'what': 'Test script',
    'strict': true,
    'commands': [
      {
        'type': 'launch',
        'which': 'chromium',
        'what': 'Chromium browser'
      },
      {
        'type': 'url',
        'which': 'https://example.com/',
        'what': 'page'
      },
      {
        'type': 'test',
        'which': 'ibm',
        'withItems': true,
        'what': 'test'
      }
    ]
  },
  noBatch: {
    'what': 'Accessibility standards',
    'hosts': [
      {
        'which': 'https://www.w3.org/TR/WCAG21/',
        'what': 'WCAG 2.1'
      },
      {
        'which': 'https://www.w3.org/WAI/standards-guidelines/aria/',
        'what': 'W3C WAI-ARIA'
      }
    ]
  }
};
const {handleRequest} = require('../index');
handleRequest(options)
.then(report => {
  console.log(`\n####### REPORT #######\n\n${JSON.stringify(report, null, 2)}`);
});
