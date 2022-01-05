/*
  alfa
  This test implements the alfa ruleset for accessibility.
*/
const {Audit} = require('@siteimprove/alfa-act');
const {Scraper} = require('@siteimprove/alfa-scraper');
console.log(`Scraper type is ${typeof Scraper}`);
console.log(`Scraper.with type is ${typeof Scraper.with}`);
console.log(`Its source is ${Scraper.with.toString()}`);
const {Rules} = require('@siteimprove/alfa-rules');
console.log(`Rules type is ${typeof Rules}`);
console.log(`Its keys are ${Object.keys(Rules)}`);
Rules.toJSON = Object.toJSON;
console.log(`Non-overridden JSON of Rules:\n${JSON.stringify(Rules, null, 2)}`);
// Conducts and reports an alfa test.
exports.reporter = async () => {
  console.log('Starting to run reporter');
  // Get the data on the elements violating the default alfa rules.
  Scraper.with(async scraper => {
    const input = await scraper.scrape('https://example.com/');
    console.log(`\n0. Input type is ${typeof input}`);
    console.log(`Its keys are ${Object.keys(input)}`);
    console.log(`\n1. Its _value property has keys ${Object.keys(input._value)}`);
    console.log(`\n2. Its _value._document property has keys ${Object.keys(input._value._document)}`);
    // console.log(`Its toJSON() function has the source ${input.toJSON.toString()}`);
    // console.log(`Input is ${JSON.stringify(input, null, 2)}`);
    const auditResult = Audit.of(input, Rules);
    console.log(`\n3. auditResult type is ${typeof auditResult}`);
    console.log(`Its keys are ${Object.keys(auditResult)}`);
    console.log(`\n4. auditResult._rules type is ${typeof auditResult._rules}`);
    console.log(`Its keys are ${Object.keys(auditResult._rules)}`);
    console.log(`\n5. auditResult._rules._head type is ${typeof auditResult._rules._head}`);
    console.log(`Its keys are ${Object.keys(auditResult._rules._head)}`);
    console.log(`\n6. auditResult._rules._head._nodes type is ${typeof auditResult._rules._head._nodes}`);
    console.log(`Its length is ${auditResult._rules._head._nodes.length}`);
    console.log(`\n7. Its first value has type ${typeof auditResult._rules._head._nodes[0]}`);
    console.log(`Its keys are ${Object.keys(auditResult._rules._head._nodes[0])}`);
    console.log(`Its second value has type ${typeof auditResult._rules._head._nodes[1]}`);
    console.log(`Its keys are ${Object.keys(auditResult._rules._head._nodes[1])}`);
    console.log(`\n8. Its _value property has type ${typeof auditResult._rules._head._nodes[0]._values}`);
    console.log(`Its length is ${auditResult._rules._head._nodes[0]._values.length}`);
    console.log(`\n9. Its first value has type ${typeof auditResult._rules._head._nodes[0]._values[0]}`);
    console.log(`Its length is ${auditResult._rules._head._nodes[0]._values[0].length}`);
    console.log(`\n10. Its first value has type ${typeof auditResult._rules._head._nodes[0]._values[0][0]}`);
    console.log(`It is ${auditResult._rules._head._nodes[0]._values[0][0]}`);
    console.log(`\n20. auditResult._rules._tail type is ${typeof auditResult._rules._tail}`);
    console.log(`Its keys are ${Object.keys(auditResult._rules._tail)}`);
    console.log(`\n21. auditResult._rules._shift type is ${typeof auditResult._rules._shift}`);
    console.log(`\n22. auditResult._rules._size type is ${typeof auditResult._rules._size}`);
    console.log(`\n23. auditResult._rules._shift is ${auditResult._rules._shift}`);
    console.log(`\n24. auditResult._rules._size is ${auditResult._rules._size}`);
    // console.log(`Its JSON is ${JSON.stringify(auditResult, null, 2)}`);
    /*
    const auditRules = auditResult._rules;
    auditRules.forEach(async auditRule => {
      // console.log(`Audit rule is ${JSON.stringify(auditRule, null, 2)}`);
      const evaluation = await auditRule[1].evaluate();
      console.log(`Evaluation is ${JSON.stringify(evaluation, null, 2)}`);
    });
    */
  });
};
exports.reporter();
