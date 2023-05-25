/*
  motion
  This test reports motion in a page. For minimal accessibility, standards require motion to be
  brief, or else stoppable by the user. But stopping motion can be difficult or impossible, and,
  by the time a user manages to stop motion, the motion may have caused annoyance or harm. For
  superior accessibility, a page contains no motion until and unless the user authorizes it. The
  test compares screen shots of the part of the page within the visible viewport. You can specify
  how many milliseconds to wait before the first screen shot (delay), how many milliseconds to wait
  between screen shots (interval), and how many screen shots to make (count). The test compares the
  screen shots and reports 9 statistics:
    0. bytes: an array of the sizes of the screen shots, in bytes
    1. localRatios: an array of the ratios of bytes of the larger to the smaller of adjacent pairs
      of screen shots
    2. meanLocalRatio: the mean of the ratios in the localRatios array
    3. maxLocalRatio: the greatest of the ratios in the localRatios array
    4. globalRatio: the ratio of bytes of the largest to the smallest screen shot
    5. pixelChanges: an array of counts of differing pixels between adjacent pairs of screen shots
    6. meanPixelChange: the mean of the counts in the pixelChanges array
    7. maxPixelChange: the greatest of the counts in the pixelChanges array
    8. changeFrequency: what fraction of the adjacent pairs of screen shots has pixel differences
  
  WARNING: This test uses the Playwright page.screenshot method, which produces incorrect results
  when the browser type is chromium and is not implemented for the firefox browser type. The only
  browser type usable with this test is webkit.
*/
const pixelmatch = require('pixelmatch');
const {PNG} = require('pngjs');
// Creates and returns a screenshot.
const shoot = async page => {
  // Make a screenshot as a buffer.
  return await page.screenshot({
    fullPage: false,
    omitBackground: true,
    timeout: 3000
  })
  .catch(error => {
    console.log(`ERROR: Screenshot failed(${error.message})`);
    return '';
  });
};
// Recursively creates and returns screenshots.
const shootAll = async (page, delay, interval, count, toDo, buffers) => {
  // Wait.
  await page.waitForTimeout(toDo === count ? delay : interval);
  // Make a screenshot.
  const buffer = await shoot(
    page, `${page.url().replace(/^.+\/\/|\/$/g, '').replace(/\//g, '+')}-${count - toDo}`
  );
  // Get its dimensions.
  if (buffer.length) {
    buffers.push(buffer);
    if (toDo > 1) {
      return shootAll(page, delay, interval, count, toDo - 1, buffers);
    }
    else {
      return buffers;
    }
  }
  else {
    return '';
  }
};
// Returns a number rounded to 2 decimal digits.
const round = (num, precision) => Number.parseFloat(num.toPrecision(precision));
// Reports motion in a page.
exports.reporter = async (page, delay, interval, count) => {
  // Make screenshots and get their image buffers.
  const shots = await shootAll(page, delay, interval, count, count, []);
  // If the shooting succeeded:
  if (shots.length === count) {
    // Get the sizes of the shots in bytes of code.
    const bytes = shots.map(shot => shot.length);
    // Get their ratios between adjacent pairs of shots.
    const localRatios = bytes.slice(1).map((size, index) => round(
      (size > bytes[index] ? size / bytes[index] : bytes[index] / size), 4
    ));
    // Get the mean and maximum of those ratios.
    const meanLocalRatio = round(
      localRatios.reduce((sum, currentRatio) => sum + currentRatio) / localRatios.length, 4
    );
    const maxLocalRatio = Math.max(...localRatios);
    // Get the ratio between the largest and smallest shot.
    const globalRatio = round((Math.max(...bytes) / Math.min(...bytes)), 4);
    // Get the shots as PNG images.
    const pngs = shots.map(shot => PNG.sync.read(shot));
    // Get their dimensions.
    const {width, height} = pngs[0];
    // Get the counts of differing pixels between adjacent pairs of shots.
    const pixelChanges = pngs
    .slice(1)
    .map((png, index) => pixelmatch(pngs[index].data, png.data, null, width, height));
    // Get the mean and maximum of those counts.
    const meanPixelChange = Math.floor(
      pixelChanges.reduce((sum, currentChange) => sum + currentChange) / pixelChanges.length
    );
    const maxPixelChange = Math.max(...pixelChanges);
    const changeFrequency = round(
      pixelChanges.reduce((count, change) => count + (change ? 1 : 0), 0) / pixelChanges.length, 2
    );
    // Return the result.
    return {
      data: {
        bytes,
        localRatios,
        meanLocalRatio,
        maxLocalRatio,
        globalRatio,
        pixelChanges,
        meanPixelChange,
        maxPixelChange,
        changeFrequency
      },
      totals: [
        2 * (meanLocalRatio - 1)
        + maxLocalRatio - 1
        + globalRatio - 1
        + meanPixelChange / 10000
        + maxPixelChange / 25000
        + 3 * changeFrequency
        || 0
      ],
      standardInstances: [{
        issueID: 'motion',
        what: 'Content moves or changes without user request',
        ordinalSeverity: 0,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      }]
    };
  }
  // Otherwise, i.e. if the shooting failed:
  else {
    // Return failure.
    return {
      data: {
        prevented: true,
        error: 'ERROR: screenshots failed'
      }
    };
  }
};
