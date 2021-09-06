// Conducts and reports a wave test.
exports.reporter = async (page, reportType) => {
  const data = await require('../../procs/test/wave').wave(page, reportType);
  return {result: data};
};
// Conducts a WAVE test and returns a Promise of a result.
const wave = (url, reportType) => {
  const waveKey = process.env.WAVE_KEY;
  // Get the data from a WAVE test.
  return new Promise(resolve => {
    https.get(
      {
        host: 'wave.webaim.org',
        path: `/api/request?key=${waveKey}&url=${url}&reporttype=${reportType}`,
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
};
