/*
  orgurls.js
  Converts a file of organization names to a file of organization names and URLs.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// Module to keep secrets local.
require('dotenv').config();
// Module to create an HTTPS server and client.
const https = require('https');
// ########## CONSTANTS
const isInUS = true;
// ########## FUNCTIONS
// Gets the URL of the website of an organization.
const getURL = orgName => {
  const kickFireKey = process.env.KICKFIRE_KEY;
  // Get the data from KickFire.
  return new Promise(resolve => {
    const countryParam = isInUS ? '&countryShort=US' : '';
    https.get(
      {
        host: 'api.kickfire.com',
        path: `/v1/name2website?key=${kickFireKey}&name=${encodeURIComponent(orgName)}${countryParam}`,
        protocol: 'https:'
      },
      response => {
        let reportText = '';
        response.on('data', chunk => {
          reportText += chunk;
        });
        // When the data arrive, return them as an object.
        response.on('end', () => {
          try {
            const report = JSON.parse(reportText);
            if (report.status === 'success' && report.results > 0) {
              return resolve(
                report
                .data
                .filter((result, index) => index === 0 || result.matchRate === 100)
                .map((result, index) => {
                  const newResult = {
                    index,
                    orgName
                  };
                  ['companyName', 'tradeName', 'website','matchRate']
                  .forEach(prop => newResult[prop] = result[prop]);
                  return newResult;
                })
              );
            }
            else {
              console.log(`Failed on ${orgName}.`);
              return resolve([{
                error: `KickFire found no matches for ${orgName}.`,
                reportText: 'NONE'
              }]);
            }
          }
          catch (error) {
            return resolve([{
              error: 'KickFire did not return JSON.',
              reportText
            }]);
          }
        });
      }
    );
  });
};
// Adds URLs to an array of organization names.
const addURLs = async (orgData, orgNames, index) => {
  if (index < orgNames.length) {
    const orgName = orgNames[index];
    orgData[index] = await getURL(orgName);
    return await addURLs(orgData, orgNames, ++index);
  }
  else {
    return Promise.resolve('');
  }
};
// Adds URLs to orgnames.txt.
const createData = async () => {
  const orgNameList = await fs.readFile('orgnames.txt', 'utf8');
  if (orgNameList.length) {
    const orgNames = orgNameList.split('\n').filter(name => name.trim().length);
    if (orgNames.length) {
      const orgData = [];
      await addURLs(orgData, orgNames, 0);
      fs.writeFile('orgurls.json', JSON.stringify(orgData, null, 2));
      console.log('File orgurls.json created.');
    }
    else {
      console.log('ERROR: No organization names found.');
    }
  }
  else {
    console.log('ERROR: Organization names file empty.');
  }
};
// ########## OPERATION
createData();
