// Reports counts and fractions of underlined links among inline links.
exports.reporter = async page => {
  // Conduct underline-link test.
  const data = await require('../../procs/test/linkUl').linkUl(page);
  return {
    result: {
      links: data.linkCount,
      inline: {
        total: data.inLinkCount,
        underlined: data.ulInLinkTexts.length,
        ulPercent: data.ulPercent
      }
    }
  };
};
