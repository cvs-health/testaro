// Creates a report for testing.
exports.reporter = async page => {
  const body = await page.$('body');
  body.tester = amount => 2 * amount;
  const output = await page.evaluate(newBody => newBody.tester(13), body);
  console.log(`output was ${output}`);
  return {result: output};
};
