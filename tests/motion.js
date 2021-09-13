const pixelmatch = require('pixelmatch');
// Reports motion in a page.
exports.reporter = async (page, delay, interval, count) => {
  // FUNCTION DEFINITIONS START
  // Creates and returns a screen shot.
  const shoot = async (page, fileName) => {
    // Make a screen shot as a buffer.
    return await page.screenshot({
      fullPage: false,
      omitBackground: true,
      path: `${process.env.REPORTDIR}/motion/${fileName}.png`
    });
  };
  // Recursively creates and returns screen shots.
  const shootAll = async (page, delay, interval, count, toDo, buffers) => {
    // Wait.
    await page.waitForTimeout(toDo === count ? delay : interval);
    // Make a screen shot.
    const buffer = await shoot(page, `motion-${count - toDo}`);
    buffers.push(buffer);
    if (toDo > 1) {
      return shootAll(page, delay, interval, count, toDo - 1, buffers);
    }
    else {
      return buffers;
    }
  };
  // FUNCTION DEFINITIONS END
  // Make screen shots and get their image buffers.
  const shots = await shootAll(page, delay, interval, count, count, []);
  // If the shooting succeeded:
  if (shots.length === count) {
    // Get the count of differing pixels between the first and last images.
    const diffCount = pixelmatch(shots[0], shots[shots.length - 1], null, )
    // Return the result.
    const sizes = shots.map(shot => shot.length);
    const localRatios = sizes.slice(1).map((size, index) => 0.01 * Math.round(
      100 * (size > sizes[index] ? size / sizes[index] : sizes[index] / size)
    ));
    const meanLocalRatio = 0.01 * Math.round(
      100 * localRatios.reduce((sum, currentRatio) => sum + currentRatio) / localRatios.length
    );
    const maxLocalRatio = Math.max(...localRatios);
    const globalRatio = 0.01 * Math.round(100 * (Math.max(...sizes) / Math.min(...sizes)));
    return {
      result: {
        sizes,
        localRatios,
        meanLocalRatio,
        maxLocalRatio,
        globalRatio
      }
    };
  }
  // Otherwise, i.e. if the shooting failed:
  else {
    // Return failure.
    return {
      result: 'screenshots failed'
    };
  }
};
