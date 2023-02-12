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
exports.reporter = async (page, messages) => {
  const pageContent = await page.content();
  // Get the data from a Nu validation.
  const dataPromise = new Promise(resolve => {
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
              console.log(`ERROR: Validation failed (${error.message})`);
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
        return resolve({
          prevented: true,
          error: error.message
        });
      });
    }
    catch(error) {
      console.log(error.message);
      return resolve({
        prevented: true,
        error: error.message
      });
    }
  });
  const timeoutPromise = new Promise(resolve => {
    const timeLimit = 12;
    const timeoutID = setTimeout(() => {
      resolve({
        prevented: true,
        error: `ERROR: Validation timed out at ${timeLimit} seconds`
      });
      clearTimeout(timeoutID);
    }, 1000 * timeLimit);
  });
  // Get the result, or an error report if nuVal timed out after 12 seconds.
  const data = await Promise.race([dataPromise, timeoutPromise]);
  // If there is a report and restrictions on the report messages were specified:
  if (! data.error && messages && Array.isArray(messages) && messages.length) {
    // Remove all messages except those specified.
    const messageSpecs = messages.map(messageSpec => messageSpec.split(':', 2));
    data.messages = data.messages.filter(message => messageSpecs.some(
      messageSpec => message.type === messageSpec[0] && message.message.startsWith(messageSpec[1])
    ));
  }
  return {result: data};
};
