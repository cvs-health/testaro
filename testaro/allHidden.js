/*
  allHidden
  This test reports a page that is entirely or mainly hidden.
*/
exports.reporter = async page => {
  const data = await page.evaluate(() => {
    const {body} = document;
    const main = body && body.querySelector('main');
    const styles = {
      doc: window.getComputedStyle(document.documentElement),
      body: body && window.getComputedStyle(body),
      main: main && window.getComputedStyle(main)
    };
    const data = {
      hidden: {
        document: document.documentElement.hidden,
        body: body ? body.hidden : false,
        main: main ? main.hidden : false
      },
      reallyHidden: {
        document: false,
        body: false,
        main: false
      },
      display: {
        document: styles.doc.display,
        body: styles.body && styles.body.display,
        main: styles.main && styles.main.display
      },
      visHidden: {
        document: styles.doc.visibility === 'hidden',
        body: styles.body ? styles.body.visibility === 'hidden' : false,
        main: styles.main ? styles.main.visibility === 'hidden' : false
      },
      ariaHidden: {
        document: document.documentElement.ariaHidden === 'true',
        body: body ? body.ariaHidden === 'true' : false,
        main: main ? main.ariaHidden === 'true' : false
      }
    };
    ['document', 'body', 'main'].forEach(element => {
      if (data.hidden[element] && ! ['block', 'flex'].includes(data.display[element])) {
        data.reallyHidden[element] = true;
      }
    });
    return data;
  });
  const standardInstances = [];
  const reportables = {
    hidden: [0, 'hidden'],
    reallyHidden: [1, 'effectively hidden'],
    visHidden: [0, 'visually hidden'],
    ariaHidden: [1, 'hidden by ARIA'],
    document: [1, 'Document', 'document.documentElement'],
    body: [1, 'Document body', 'document.body'],
    main: [0, 'main region', 'main, [role="main"]']
  };
  ['document', 'body', 'main'].forEach(region => {
    ['hidden', 'reallyHidden', 'visHidden', 'ariaHidden'].forEach(hider => {
      if (data[hider][region]) {
        standardInstances.push({
          issueID: `allHidden-${hider}-${region}`,
          what: `${reportables[region][1]} ${reportables[hider][1]}`,
          ordinalSeverity: reportables[region][0] + reportables[hider][0] || 0,
          location: {
            doc: 'dom',
            type: 'selector',
            spec: reportables[region][2]
          },
          excerpt: ''
        });
      }
    });
  });
  const totals = [0, 0, 0, 0];
  standardInstances.forEach(instance => {
    totals[instance.ordinalSeverity]++;
  });
  return {
    data,
    totals,
    standardInstances
  };
};
