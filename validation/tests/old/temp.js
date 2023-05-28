// temp.js
// Validation job converter.

const fs = require('fs/promises');
fs.readdir('.').then(async fileNames => {
  const jobNames = fileNames.filter(fileName => fileName.endsWith('.json'));
  for (const jobName of jobNames) {
    const jobJSON = await fs.readFile(jobName, 'utf8');
    const job = JSON.parse(jobJSON);
    const {acts} = job;
    acts.forEach(act => {
      if (act.type === 'test') {
        const {which, expect} = act;
        act.which = 'testaro';
        act.withItems = true;
        act.rules = [
          'y',
          which
        ];
        expect.forEach((expectation, index) => {
          expect[index][0] = `result.rules.${which}.data.${expect[index][0]}`;
        });
      }
    });
    job.creationTime = '2013-05-28T12:00:00';
    await fs.writeFile(`new/${jobName}`, `${JSON.stringify(job, null, 2)}\n`);
  }
});
