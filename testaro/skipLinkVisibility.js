/*
  Rule: skipLinkVisibility
  Detects deficiencies in skip-link visibility.
*/

exports.reporter = async (page, withItems) => {
  // Selecciona todos los skip-links típicos
  const skipLinks = await page.$$('a[href^="#"]');
  let count = 0;
  let details = [];

  for (const link of skipLinks) {
    const text = await link.evaluate(el => el.textContent.trim().toLowerCase());
    if (!/skip|saltar|ir a|omitir|go to|jump to|bypass/i.test(text)) continue;

    // Verifica visibilidad al cargar
    const initiallyVisible = await link.evaluate(el => {
      const style = window.getComputedStyle(el);
      const left = parseInt(style.left, 10);
      const top = parseInt(style.top, 10);
      const outOfViewport = (left < -100 || top < -100);
      return {
        visible: style.visibility !== 'hidden' && style.display !== 'none' && el.offsetWidth > 0 && el.offsetHeight > 0 && !outOfViewport,
        style: {
          visibility: style.visibility,
          display: style.display,
          left: style.left,
          top: style.top,
          width: el.offsetWidth,
          height: el.offsetHeight
        }
      };
    });

    // Simula foco por teclado
    await link.focus();
    const focusedVisible = await link.evaluate(el => {
      const style = window.getComputedStyle(el);
      const left = parseInt(style.left, 10);
      const top = parseInt(style.top, 10);
      const outOfViewport = (left < -100 || top < -100);
      return {
        visible: style.visibility !== 'hidden' && style.display !== 'none' && el.offsetWidth > 0 && el.offsetHeight > 0 && !outOfViewport,
        style: {
          visibility: style.visibility,
          display: style.display,
          left: style.left,
          top: style.top,
          width: el.offsetWidth,
          height: el.offsetHeight
        }
      };
    });

    console.log(`Skip-link '${text}': initiallyVisible =`, initiallyVisible, 'focusedVisible =', focusedVisible);

    // Verifica contraste y tamaño mínimos si es visible al recibir foco
    let contrastOk = true;
    let sizeOk = true;
    if (focusedVisible) {
      const style = await link.evaluate(el => {
        const s = window.getComputedStyle(el);
        return {
          color: s.color,
          backgroundColor: s.backgroundColor,
          fontSize: s.fontSize,
          width: el.offsetWidth,
          height: el.offsetHeight
        };
      });
      // Contraste mínimo (simplificado, solo verifica que no sea igual)
      contrastOk = style.color !== style.backgroundColor;
      // Tamaño mínimo recomendado: 44x44px
      sizeOk = style.width >= 44 && style.height >= 44;
    }

    if (!initiallyVisible.visible && !focusedVisible.visible) {
      count++;
      details.push(`Skip-link '${text}' is never visible, even when focused. Styles: ${JSON.stringify(initiallyVisible.style)}, ${JSON.stringify(focusedVisible.style)}`);
    } else if (!initiallyVisible.visible && focusedVisible.visible && (!contrastOk || !sizeOk)) {
      count++;
      details.push(`Skip-link '${text}' is only visible when focused, but does not meet minimum contrast or size. Styles: ${JSON.stringify(focusedVisible.style)}`);
    } else if (!initiallyVisible.visible && focusedVisible.visible) {
      count++;
      details.push(`Skip-link '${text}' is only visible when focused. Styles: ${JSON.stringify(focusedVisible.style)}`);
    }
  }

  return {
    totals: [0, 0, count, 0],
    standardInstances: count > 0 ? [{
      ruleID: 'skipLinkVisibility',
      what: 'Deficiencies in skip-link visibility',
      ordinalSeverity: 2,
      count,
      tagName: 'A',
      id: '',
      location: { doc: '', type: '', spec: '' },
      excerpt: details.join('\n'),
      boxID: '',
      pathID: ''
    }] : []
  };
};
