/* eslint-disable no-undef */
/*
  continuum
  This test implements the Continuum ruleset.
*/

// FUNCTIONS
// Runs Continuum on the page.
exports.reporter = async (page, options) => {
  const {rules} = options;
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
    // Run the Continuum ruleset and get the result, failing if none within 30 seconds.
    result = await page.evaluate(async rules => {
      continuum.setUp(null, null, window);
      // If a set of rules to be employed was specified:
      let bigResultPromise;
      if (rules && Array.isArray(rules) && rules.length && rules.every(rule => typeof rule === 'string')) {
        // Run the tests for them.
        bigResultPromise = continuum.runTests(rules.map(rule => Number.parseInt(rule)));
      }
      // Otherwise, i.e. if no rules were specified:
      else {
        // Run all the tests.
        bigResultPromise = continuum.runAllTests();
      }
      // Allow 30 seconds for the result compilation.
      const deadlinePromise = new Promise(resolve => {
        setTimeout(() => {
          resolve('timeout');
        }, 30000);
      });
      const bigResult = await Promise.race([bigResultPromise, deadlinePromise]);
      // If the result compilation succeeded:
      if (Array.isArray(bigResult)) {
        // Return a compact version of it, removing useless and invariant properties.
        return bigResult.map(bigItem => {
          const item = bigItem._rawEngineJsonObject;
          delete item.testResult;
          delete item.fixType;
          delete item.fingerprint.encoding;
          if (item.element.length > 240) {
            item.element = `${item.element.slice(0, 200)} ... ${item.element.slice(-200)}`;
          }
          return item;
        });
      }
      else if (bigResult === 'timeout') {
        return {
          prevented: true,
          error: 'ERROR: Running tests timed out'
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
