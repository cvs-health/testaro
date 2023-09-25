/*
  aslint
  Injects and captures results from the ASLint bundle.
*/
const options = {
  asyncRunner: true,
  context: document.documentElement,
  includeElementReference: true,
  reportFormat: {JSON: true},
  watchDomChanges: false
};
const bundleEl = document.getElementById('aslintBundle');
console.log('Defined bundle');
window
.aslint
.config(options)
.addListener('onValidatorStarted', function () {
  console.log('@ Validator started');
})
.addListener('onValidatorComplete', function (error, report) {
  console.log('@ Validator Complete');
})
.addFilter('onBeforeRuleReport', function (report) {
  return report;
})
.setRule('turn-me-off', {isSelectedForScanning: false})
.run()
.then(function (result) {
  const resultEl = document.createElement('pre');
  resultEl.id = 'aslintResult';
  console.log('About to populate result element');
  console.log(`result keys are ${Object.keys(result)}`);
  if (result.rules) {
    const ruleIDs = Object.keys(result.rules);
    ruleIDs.forEach(ruleID => {
      try {
        JSON.stringify(result.rules[ruleID]);
      }
      catch(error) {
        console.log(`ERROR: Rule ${ruleID} result not stringifiable so deleted`);
        delete result.rules[ruleID];
      }
    });
  }
  resultEl.textContent = JSON.stringify(result, null, 2);
  console.log(`Result:\n${resultEl.textContent}`);
  console.log('Populated result element');
  document.body.insertAdjacentElement('beforeend', resultEl);
  console.log('Result element inserted')
})
.catch(error => {
  console.error('[ASLint error]', error);
});
