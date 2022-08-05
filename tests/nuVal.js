/*
  nuVal
  This test subjects a page to the Nu Html Checker.
*/
const https = require('https');
exports.reporter = async page => {
  const pageContent = await page.content();
  // Get the data from a Nu validation.
  const data = await new Promise(resolve => {
    const request = https.request(
      {
        host: 'validator.nu',
        path: '?parser=html&out=json',
        method: 'POST',
        headers: {
          'Content-Type': 'text/html; charset=utf8'
        }
      },
      response => {
        let report = '';
        response.on('data', chunk => {
          report += chunk;
        });
        // When the data arrive:
        response.on('end', async () => {
          try {
            // Delete unnecessary properties.
            const result = JSON.parse(report);
            return resolve(result);
          }
          catch (error) {
            return resolve({
              prevented: true,
              error: error.message,
              report
            });
          }
        });
      }
    );
    request.write(pageContent);
    request.end();
  });
  return {result: data};
};
