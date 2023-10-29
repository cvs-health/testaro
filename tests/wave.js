/*
  wave
  This test implements the WebAIM WAVE ruleset for accessibility. The 'reportType' argument
  specifies a WAVE report type: 1, 2, 3, or 4. The larger the number, the more detailed (and
  expensive) the report.
*/
const fs = require('fs/promises');
const https = require('https');
exports.reporter = async (page, options) => {
  const {reportType, rules} = options;
  const waveKey = process.env.WAVE_KEY;
  // Get the data from a WAVE test.
  const data = {};
  const result = await new Promise(resolve => {
    https.get(
      {
        host: 'wave.webaim.org',
        path: `/api/request?key=${waveKey}&url=${page.url()}&reporttype=${reportType}`,
        protocol: 'https:'
      },
      response => {
        let actReport = '';
        response.on('data', chunk => {
          actReport += chunk;
        });
        // When the data arrive:
        response.on('end', async () => {
          try {
            // Delete unnecessary properties.
            const actResult = JSON.parse(actReport);
            const {categories} = actResult;
            delete categories.feature;
            delete categories.structure;
            delete categories.aria;
            // If rules were specified:
            if (rules && rules.length) {
              // Delete the results of tests for other rules.
              ['error', 'contrast', 'alert'].forEach(category => {
                if (
                  categories[category]
                  && categories[category].items
                  && Object.keys(categories[category].items).length
                ) {
                  Object.keys(categories[category].items).forEach(ruleID => {
                    if (! rules.includes(ruleID)) {
                      delete categories[category].items[ruleID];
                    }
                  });
                }
              });
            }
            // Add WCAG information from the WAVE documentation.
            const waveDocJSON = await fs.readFile('procs/wavedoc.json');
            const waveDoc = JSON.parse(waveDocJSON);
            Object.keys(categories).forEach(categoryName => {
              const category = categories[categoryName];
              const {items} = category;
              Object.keys(items).forEach(issueName => {
                const issueDoc = waveDoc.find((issue => issue.name === issueName));
                const {guidelines} = issueDoc;
                items[issueName].wcag = guidelines;
              });
            });
            return resolve(actResult);
          }
          catch (error) {
            data.prevented = true;
            data.error = error.message;
            return resolve({
              actReport
            });
          }
        });
      }
    );
  });
  return {
    data,
    result
  };
};
