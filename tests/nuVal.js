/*
  nuVal
  This test subjects a page to the Nu Html Checker.
*/
const https = require('https');
exports.reporter = async page => {
  const pageContent = await page.content();
  // Get the data from a Nu validation.
  const data = await new Promise((resolve, reject) => {
    try {
      const request = https.request(
        {
          // Alternatives: host=validator.w3.org; path=/nu/?parser=html@out=json
          host: 'validator.nu',
          path: '/?parser=html&out=json',
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'text/html; charset=utf-8'
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
              console.log(`Validation failed (${error.message})`);
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
      request.on('error', error => {
        console.log(error.message);
        return reject({
          prevented: true,
          error: error.message
        });
      });
    }
    catch(error) {
      console.log(error.message);
      return reject({
        prevented: true,
        error: error.message
      });
    }
  });
  return {result: data};
};
