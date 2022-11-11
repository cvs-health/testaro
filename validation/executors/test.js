// test.js
// Validator for one Testaro test.
// Execution example: npm test focOp

const testID = process.argv[2];
const {validateTest} = require('../validateTest');
validateTest(testID);
