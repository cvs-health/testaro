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
      shootAll(page, delay, interval, count, toDo - 1, buffers);
    }
    else {
      return buffers;
    }
  };
  // FUNCTION DEFINITIONS END
  // Make screen shots.
  const shots = await shootAll(page, delay, interval, count, count, []);
  // If the shooting succeeded:
  if (shots.length === count) {
    // Return the result.
    const sizes = shots.map(shot => shot.length);
    const localRatios = sizes.slice(1).map((size, index) => (
      size > sizes[index -1] ? size / sizes[index - 1] : sizes[index - 1] / size
    ).toFixed(2));
    const maxLocalRatio = Math.max(localRatios);
    const globalRatio = (Math.max(sizes) / Math.min(sizes)).toFixed(2);
    const meanLocalRatio = (
      localRatios.reduce((mean, currentRatio) => mean + currentRatio) / localRatios.length
    ).toFixed(2);
    return {
      result: {
        sizes,
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
