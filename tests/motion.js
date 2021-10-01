const pixelmatch = require('pixelmatch');
const {PNG} = require('pngjs');
// Reports motion in a page.
exports.reporter = async (page, delay, interval, count) => {
  // FUNCTION DEFINITIONS START
  // Creates and returns a screen shot.
  const shoot = async (page, fileName) => {
    // Make a screen shot as a buffer.
    return await page.screenshot({
      fullPage: false,
      omitBackground: true,
      timeout: 3000,
      path: `${process.env.REPORTDIR}/motion/${fileName}.png`
    })
    .catch(error => {
      console.log(`ERROR: SCREEN SHOT FOR ${fileName} FAILED: ${error.message}`);
      return '';
    });
  };
  // Recursively creates and returns screen shots.
  const shootAll = async (page, delay, interval, count, toDo, buffers) => {
    // Wait.
    await page.waitForTimeout(toDo === count ? delay : interval);
    // Make a screen shot.
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
  // FUNCTION DEFINITIONS END
  // Make screen shots and get their image buffers.
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
      result: {
        bytes,
        localRatios,
        meanLocalRatio,
        maxLocalRatio,
        globalRatio,
        pixelChanges,
        meanPixelChange,
        maxPixelChange,
        changeFrequency
      }
    };
  }
  // Otherwise, i.e. if the shooting failed:
  else {
    // Return failure.
    return {result: {error: 'ERROR: screenshots failed'}};
  }
};
