// Creates a perfunctory useless report for testing.
exports.reporter = async page => ({
  result: {
    url: page.url(),
    issueType: 'whatever',
    issueCount: 999,
    meanScore: 99.9
  }
});
