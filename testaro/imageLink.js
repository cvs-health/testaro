/*
  imageLink
  Clean-room rule: flag anchor elements whose `href` points to an image file.
*/

const {simplify} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  const ruleData = {
    ruleID: 'imageLink',
    selector: 'a[href]',
    pruner: async (loc) => {
      return loc.evaluate(el => {
        const href = el.getAttribute('href') || '';
        return /\.(?:png|jpe?g|gif|svg|webp|ico)(?:$|[?#])/i.test(href);
      });
    },
    isDestructive: false,
    complaints: {
      instance: 'Link destination is an image file',
      summary: 'Links have image files as their destinations'
    },
    ordinalSeverity: 0,
    summaryTagName: 'A'
  };
  return await simplify(page, withItems, ruleData);
};
