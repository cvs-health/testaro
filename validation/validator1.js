/*
  validator
  Script that executes the application with a validation script and a batch.
*/
const scriptName = process.argv[2];
const fs = require('fs');
const validator = async scriptName => {
  const {handleRequest} = require('../index');
  const scriptJSON = fs.readFileSync(`validation/scripts/${scriptName}.json`);
  const script = JSON.parse(scriptJSON);
  const withBatch = {
    what: 'batch with 2 hosts',
    batch: {
      what: 'pages of two different sizes; each should pass one and fail one test',
      hosts: [
        {
          which: 'file://__dirname/validation/targets/bulk/good.html',
          what: 'small page'
        },
        {
          which: 'file://__dirname/validation/targets/bulk/bad.html',
          what: 'large page'
        },
      ]
    }
  };
  return await handleRequest({
    script,
    withBatch
  });
};
validator(scriptName)
.then(result => {
  console.log(`\n####### REPORT LIST #######\n\n${JSON.stringify(result, null, 2)}`);
});
