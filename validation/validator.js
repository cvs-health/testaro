/*
  validator
  Script that executes the application with a validation script.
*/
const scriptName = process.argv[2];
const fs = require('fs');
const validator = scriptName => {
  const {handleRequest} = require('../index');
  const scriptJSON = fs.readFileSync(`validation/scripts/${scriptName}.json`);
  const script = JSON.parse(scriptJSON);
  handleRequest({script});
};
validator(scriptName);
