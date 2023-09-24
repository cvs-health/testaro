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
bundleEl.addEventListener('load', () => {
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
    resultEl.textContent = result;
    document.body.insertAdjacentElement('beforeend', resultEl);
  })
  .catch(error => {
    console.error('[ASLint error]', error);
  });
});
