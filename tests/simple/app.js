// Compiles a report.
exports.reporter = async page => {
  // Return a result object.
  return {
    url: page.url(),
    issueType: 'whatever',
    issueCount: 999,
    meanScore: 17.5
  };
};
