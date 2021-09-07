// Reports motion in a page.
exports.reporter = async page => {
  // FUNCTION DEFINITIONS START
  // Creates and returns a screen shot.
  const shoot = async (page, fileName) => {
    // Make a screen shot as a buffer.
    return await page.screenshot({
      fullPage: false,
      omitBackground: true,
      path: `${fileName}.png`
    });
  };
  // Creates and returns 2 screen shots after a wait and at a time interval in ms.
  const shootTwice = async (page, wait, interval) => {
    // Make 2 screen shots of the page.
    await page.waitForTimeout(wait);
    const beforeBuffer = await shoot(page, 'before');
    await page.waitForTimeout(interval);
    const afterBuffer = await shoot(page, 'after');
    return [beforeBuffer, afterBuffer];
  };
  // FUNCTION DEFINITIONS END
  // Make 2 screen shots 3 seconds apart after 2 seconds.
  const shots = await shootTwice(page, 2000, 3000);
  // If the shooting succeeded:
  if (shots.length === 2) {
    // Return the result.
    const sizes = [shots[0].length, shots[1].length];
    return {
      result: {
        sizes,
        ratio: (sizes[0] > sizes[1] ? sizes[0] / sizes[1] : sizes[1] / sizes[0]).toFixed(2)
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
