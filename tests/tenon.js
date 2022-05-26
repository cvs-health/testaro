/*
  tenon
  This test processes a previously requested test by the Tenon API.
*/
const https = require('https');
exports.reporter = async (tenonData, id) => {
  // Universal request options.
  const requestOptions = {
    host: 'tenon.io',
    path: `/api/v2/${tenonData.responseIDs[id]}`,
    port: 443,
    protocol: 'https:',
    headers: {
      Authorization: tenonData.access_token,
      'Cache-Control': 'no-cache'
    }
  };
  // Gets the test status.
  const getStatus = async () => {
    const testStatus = await new Promise((resolve, reject) => {
      requestOptions.method = 'HEAD';
      const statusRequest = https.request(requestOptions, statusResponse => {
        const {statusCode} = statusResponse;
        resolve(statusCode);
      });
      statusRequest.on('error', error => {
        console.log(`ERROR getting Tenon test status (${error.message})`);
        reject(`ERROR getting Tenon test status (${error.message})`);
      });
      statusRequest.end();
    });
    return testStatus;
  };
  // Get the test status.
  let testStatus = getStatus();
  // If the test is still in the Tenon queue:
  if (testStatus === '202') {
    // Wait 20 seconds and get the status again.
    setTimeout(() => {
      testStatus = getStatus();
    }, 20000);
  }
  // If the test has been completed:
  if (testStatus ===  '200') {
    // Get the test result.
    const testResult = await new Promise((resolve, reject) => {
      requestOptions.method = 'GET';
      const resultRequest = https.request(requestOptions, resultResponse => {
        const {statusCode} = resultResponse;
        if (statusCode === '200') {
          let resultJSON = '';
          resultResponse.on('data', chunk => {
            resultJSON += chunk;
          });
          resultResponse.on('end', () => {
            try {
              const result = JSON.parse(resultJSON);
              resolve(result.response);
            }
            catch(error) {
              console.log(`ERROR getting Tenon test result (${resultJSON.slice(0, 80)})`);
              resolve({
                error: 'ERROR getting Tenon test result',
                resultStart: resultJSON.slice(0, 80)
              });
            }
          });
        }
        else {
          resolve({
            error: 'ERROR: Tenon test not yet completed'
          });
        }
      });
      resultRequest.on('error', error => {
        console.log(`ERROR getting Tenon test result (${error.message})`);
        reject({
          error: `ERROR getting Tenon test result (${error.message})`
        });
      });
      resultRequest.end();
    });
    return {result: testResult};
  }
  // Otherwise, i.e. if the test has not been completed:
  else {
    // Report the test status.
    return {result: {
      error: testStatus
    }};
  }
};
