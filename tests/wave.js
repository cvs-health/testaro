/*
  wave
  This test implements the WebAIM WAVE ruleset for accessibility. The 'reportType' argument
  specifies a WAVE report type: 1, 2, 3, or 4. The larger the number, the more detailed (and
  expensive) the report.
*/
const https = require('https');
exports.reporter = async (page, reportType) => {
  const waveKey = process.env.WAVE_KEY;
  // Get the data from a WAVE test.
  const data = await new Promise(resolve => {
    https.get(
      {
        host: 'wave.webaim.org',
        path: `/api/request?key=${waveKey}&url=${page.url()}&reporttype=${reportType}`,
        protocol: 'https:'
      },
      response => {
        let report = '';
        response.on('data', chunk => {
          report += chunk;
        });
        // When the data arrive, return them as an object.
        response.on('end', () => {
          try {
            const result = JSON.parse(report);
            const {categories} = result;
            delete categories.feature;
            delete categories.structure;
            delete categories.aria;
            return resolve(result);
          }
          catch (error) {
            return resolve({
              prevented: true,
              error: 'WAVE did not return JSON.',
              report
            });
          }
        });
      }
    );
  });
  return {result: data};
};
