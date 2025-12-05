/*
  Rule: linkButtonConfusion
  Detects <a> elements that visually resemble buttons.
*/

exports.reporter = async (page, withItems) => {
  // Selecciona todos los enlaces visibles en la página
  const links = await page.$$('a');
  let count = 0;
  for (const link of links) {
    const visible = await link.evaluate(el => {
      const style = window.getComputedStyle(el);
      return !(style.display === 'none' || style.visibility === 'hidden' || el.offsetParent === null);
    });
    if (!visible) continue;
    const style = await link.evaluate(el => {
      const s = window.getComputedStyle(el);
      return {
        backgroundColor: s.backgroundColor,
        paddingLeft: s.paddingLeft,
        paddingTop: s.paddingTop,
        borderStyle: s.borderStyle,
        borderWidth: s.borderWidth,
        textDecoration: s.textDecoration,
        textDecorationLine: s.textDecorationLine,
        cursor: s.cursor,
        className: el.className,
        inlineBackground: el.style.background,
        role: el.getAttribute('role') || ''
      };
    });
    const isButtonLike = (
      (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') &&
      (parseInt(style.paddingLeft) > 4 || parseInt(style.paddingTop) > 4) &&
      (style.borderStyle !== 'none' && style.borderStyle !== '' && style.borderWidth !== '0px') &&
      (style.textDecoration === 'none' || style.textDecorationLine === 'none') &&
      (style.cursor === 'pointer')
    ) ||
    /btn|button/i.test(style.className) ||
    (style.inlineBackground && style.inlineBackground !== 'none' && style.inlineBackground !== 'transparent');
    if (isButtonLike && style.role !== 'button') {
      count++;
    }
  }
  // Construye el resultado serializable
  return {
    totals: [0, 0, count, 0],
    standardInstances: count > 0 ? [{
      ruleID: 'linkButtonConfusion',
      what: 'Links that visually resemble buttons',
      ordinalSeverity: 2,
      count,
      tagName: 'A',
      id: '',
      location: { doc: '', type: '', spec: '' },
      excerpt: '',
      boxID: '',
      pathID: ''
    }] : []
  };
};
