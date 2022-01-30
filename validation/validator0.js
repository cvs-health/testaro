/*
  validator0
  Script that executes the application with a validation script and no batch.
*/
const scriptName = process.argv[2];
const fs = require('fs');
const validator = async scriptName => {
  const {handleRequest} = require('../index');
  const scriptJSON = fs.readFileSync(`validation/scripts/${scriptName}.json`);
  const script = JSON.parse(scriptJSON);
  return await handleRequest({script});
};
validator(scriptName)
.then(result => {
  console.log(`\n####### REPORT #######\n\n${JSON.stringify(result, null, 2)}`);
});
