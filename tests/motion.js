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
    // const beforePNG = beforeBuffer.toString('base64');
    // const afterPNG = afterBuffer.toString('base64');
    return [beforeBuffer, afterBuffer];
  };
  // FUNCTION DEFINITIONS END
  // Make 2 screen shots 3 seconds apart.
  const shots = await shootTwice(page, 2000, 3000);
  // If the shooting succeeded:
  if (shots.length === 2) {
    console.log(`First screen shot has length ${shots[0].length}`);
    console.log(`Second screen shot has length ${shots[1].length}`);
    // console.log(`First buffer length is ${beforeBuffer.length}`);
    // console.log(`Second buffer length is ${afterBuffer.length}`);
    console.log(`Buffers identical? ${Buffer.compare(shots[0], shots[1])}`);
    // Return success and the exhibits.
    return {
      result: 'screenshots made',
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
