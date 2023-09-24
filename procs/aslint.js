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
// bundleEl.addEventListener('load', () => {
  console.log('Bundle loaded');
  window
  .aslint
  .config(options)
  .addListener('onValidatorStarted', function () {
    console.log('@ Validator started');
  })
  .addListener('onValidatorComplete', function (error, report) {
    console.log('@ Validator Complete', error, report);
  })
  .addFilter('onBeforeRuleReport', function (report) {
    return report;
  })
  .setRule('turn-me-off', {isSelectedForScanning: false})
  .run()
  .then(function (result) {
    const resultEl = document.createElement('pre');
    resultEl.id = 'aslintResult';
    resultEl.textContent = JSON.stringify(result, null, 2);
    document.body.insertAdjacentElement('beforeend', resultEl);
  })
  .catch(error => {
    console.error('[ASLint error]', error);
  });
// });
