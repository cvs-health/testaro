/*
  axe
  This test implements the WAVE test package for accessibility.

  The reportType argument specifies a WAVE report type. Its values may be any integer from 1 to 4.
*/
// Import a module to create an HTTPS server and client.
const https = require('https');
// Conducts and reports a wave test.
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
            const categories = result.categories;
            delete categories.feature;
            delete categories.structure;
            delete categories.aria;
            return resolve(result);
          }
          catch (error) {
            return resolve({
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
