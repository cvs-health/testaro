// Compiles a report.
exports.reporter = async page => ({
  result: {
    url: page.url(),
    issueType: 'whatever',
    issueCount: 999,
    meanScore: 17.5
  }
});
