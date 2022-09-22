/*
  allHidden
  This test reports a page that is entirely or mainly hidden.
*/
exports.reporter = async page => {
  const data = await page.evaluate(() => {
    const {body} = document;
    const main = body ? body.querySelector('main') : null;
    const styles = {
      doc: window.getComputedStyle(document.documentElement),
      body: body ? window.getComputedStyle(body) : null,
      main: main ? window.getComputedStyle(main) : null
    };
    const data = {
      hidden: {
        document: document.documentElement.hidden,
        body: body && body.hidden,
        main: main && main.hidden
      },
      reallyHidden: {
        document: false,
        body: false,
        main: false
      },
      display: {
        document: styles.doc && styles.doc.display,
        body: styles.body && styles.body.display,
        main: styles.main && styles.main.display
      },
      visHidden: {
        document: styles.doc && styles.doc.visibility === 'hidden',
        body: styles.body && styles.body.visibility === 'hidden',
        main: styles.main && styles.main.visibility === 'hidden'
      },
      ariaHidden: {
        document: document.documentElement.ariaHidden === 'true',
        body: body && body.ariaHidden === 'true',
        main: main && main.ariaHidden === 'true'
      }
    };
    ['document', 'body', 'main'].forEach(element => {
      if (data.hidden[element] && ! ['block', 'flex'].includes(data.display[element])) {
        data.reallyHidden[element] = true;
      }
    });
  });
  return {result: data};
};
