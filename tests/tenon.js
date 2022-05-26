/*
  tenon
  This test processes a previously requested test by the Tenon API.
*/
const https = require('https');
exports.reporter = async (page, which) => {
  // Authenticate with the Tenon API.
  const authData = await new Promise(resolve => {
    const request = https.request(
      {
        host: 'tenon.io',
        path: '/api/v2/auth',
        port: 443,
        protocol: 'https:',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      },
      response => {
        let responseData = '';
        response.on('data', chunk => {
          responseData += chunk;
        });
        response.on('end', () => {
          try {
            const responseJSON = JSON.parse(responseData);
            return resolve(responseJSON);
          }
          catch(error) {
            return resolve({
              error: 'Tenon did not return JSON authentication data.',
              responseData
            });
          }
        });
      }
    );
    const postData = JSON.stringify({
      username: tenonUser,
      password: tenonPassword
    });
    request.write(postData);
    request.end();
  });
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
