/*
  tenon
  This test processes a previously requested test by the Tenon API.
*/
const https = require('https');
exports.reporter = async (tenonData, which) => {
  // Identify the status-request options.
  const statusOptions = {
    host: 'tenon.io',
    path: `/api/v2/${tenonData.responseIDs[which]}`,
    port: 443,
    protocol: 'https:',
    method: 'HEAD',
    headers: {
      Authorization: tenonData.access_token,
      'Cache-Control': 'no-cache'
    }
  };
  // Identify the result-request options.
  const resultOptions = {
    host: 'tenon.io',
    path: `/api/v2/${tenonData.responseIDs[which]}`,
    port: 443,
    protocol: 'https:',
    method: 'GET',
    headers: {
      Authorization: tenonData.access_token,
      'Cache-Control': 'no-cache'
    }
  };
  let result = {};
  // Request the test status.
  https.request(statusOptions, response => {
    const {statusCode} = response;
    if (statusCode ===  '200') {
      const resultRequest = https.request(resultOptions, response => {
        result = response.response;
      });
    }
    else {
      result = {
        error: 'ERROR: tenon test not yet completed'
      };
    }
  });
  const testStatus = async (tenonData, which) => {
    const statusResponse = statusRequest.end();
    const status = await new Promise(resolve => {
      const request = https.request(
        {
          host: 'tenon.io',
          path: `/api/v2/${tenonData.responseIDs[which]}`,
          port: 80,
          protocol: 'https:',
          method: 'HEAD',
          headers: {
            'Cache-Control': 'no-cache'
          }
        },
        response => {
          response.on('end', () => {
            const statusCode = response.statusCode;
            return resolve(statusCode);
          });
        }
      );
      request.end();
    });
    return status;
  };
  if (authData.access_token) {
    // Get a response ID for a Tenon test.
    const responseID = await new Promise(resolve => {
      const request = https.request(
        {
          host: 'tenon.io',
          path: '/api/',
          port: 443,
          protocol: 'https:',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${authData.access_token}`
          }
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
              return resolve(result);
            }
            catch (error) {
              return resolve({
                error: 'Tenon did not return JSON.',
                report
              });
            }
          });
        }
      );
      const postData = JSON.stringify({
        url: page.url()
      });
      request.write(postData);
      request.end();
    });
    return {result: responseID};
  }
};
