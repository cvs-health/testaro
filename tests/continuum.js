/* eslint-disable no-undef */
/*
  continuum
  This test implements the Continuum ruleset.
*/

// FUNCTIONS
// Runs Continuum on the page.
exports.reporter = async page => {
  let result = {};
  // Inject the continuum scripts into the page, exposing the continuum object.
  for (const fileName of ['continuum.conf', 'AccessEngine.community', 'Continuum.community']) {
    if (! result.prevented) {
      await page.addScriptTag({
        path: `${__dirname}/../continuum/${fileName}.js`
      })
      .catch(error => {
        console.log(`ERROR adding the ${fileName} script to the page (${error.message})`);
        result.prevented = true;
        result.error = `ERROR adding the ${fileName} script to the page`;
      });
    }
  }
  if (! result.prevented) {
    // Run the Continuum ruleset and get the result.
    result = await page.evaluate(async () => {
      continuum.setUp(null, null, window);
      let bigResult = await continuum.runAllTests();
      if (Array.isArray(bigResult) && bigResult.length) {
        return bigResult.map(bigItem => {
          const item = bigItem._rawEngineJsonObject;
          delete item.fingerprint.encoding;
          if (item.element.length > 200) {
            item.element = `${item.element.slice(0, 100)} ... ${item.element.slice(-100)}`;
          }
          return item;
        });
      }
      else {
        return [];
      }
    });
  }
  return {result};
};
