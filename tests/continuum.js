/* eslint-disable no-undef */
/*
  continuum
  This test implements the Continuum ruleset.
*/

// FUNCTIONS
// Runs Continuum on the page.
exports.reporter = async (page, rules) => {
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
    // Run the Continuum ruleset and get the result, failing if none within 20 seconds.
    result = await page.evaluate(async rules => {
      continuum.setUp(null, null, window);
      // If a set of rules to be employed was specified:
      let bigResultPromise;
      if (rules && Array.isArray(rules) && rules.length && rules.every(rule => typeof rule === 'number')) {
        // Run the tests for them.
        bigResultPromise = continuum.runTests(rules);
      }
      // Otherwise, i.e. if no rules were specified:
      else {
        // Run all the tests.
        bigResultPromise = continuum.runAllTests();
      }
      // Allow 20 seconds for the result compilation.
      const deadlinePromise = new Promise(resolve => {
        setTimeout(() => {
          resolve('timeout');
        }, 20000);
      });
      const bigResult = await Promise.race([bigResultPromise, deadlinePromise]);
      if (Array.isArray(bigResult)) {
        return bigResult.map(bigItem => {
          const item = bigItem._rawEngineJsonObject;
          delete item.fingerprint.encoding;
          if (item.element.length > 200) {
            item.element = `${item.element.slice(0, 100)} ... ${item.element.slice(-100)}`;
          }
          return item;
        });
      }
      else if (bigResult === 'timeout') {
        return {
          prevented: true,
          error: 'ERROR: Running all tests timed out'
        };
      }
      else {
        return {
          prevented: true,
          error: 'ERROR: Invalid result'
        };
      }
    }, rules);
  }
  return {result};
};
