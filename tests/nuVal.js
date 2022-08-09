/*
  nuVal
  This test subjects a page to the Nu Html Checker.
  That API erratically replaces left and right double quotation marks with invalid UTF-8, which
  appears as 2 or 3 successive instances of the replacement character (U+fffd). Therefore, this
  test removes all such quotation marks and the replacement character. That causes
  'Bad value “” for' to become 'Bad value  for'. Since the corruption of quotation marks is
  erratic, no better solution is known.
*/
const https = require('https');
exports.reporter = async page => {
  const pageContent = await page.content();
  // Get the data from a Nu validation.
  const data = await new Promise((resolve, reject) => {
    try {
      const request = https.request(
        {
          /*
            Alternatives (more timeout-prone): host=validator.nu; path=/?parser=html@out=json
            That host crashes instead of ending with a fatal error.
          */
          host: 'validator.w3.org',
          path: '/nu/?parser=html&out=json',
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
              // Delete left and right quotation marks and their erratic invalid replacements.
              const result = JSON.parse(report.replace(/[\u{fffd}“”]/ug, ''));
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
