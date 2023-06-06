/*
  allHidden
  This test reports a page that is entirely or mainly hidden.
*/
exports.reporter = async page => {
  // Gets the hiddennesses of the document, body, and main region.
  const data = await page.evaluate(() => {
    // Identify the styles of the document, its body, and its main region.     
    const {body} = document;
    const main = body && body.querySelector('main, [role=main]');
    const styles = {
      doc: window.getComputedStyle(document.documentElement),
      body: body && window.getComputedStyle(body),
      main: main && window.getComputedStyle(main)
    };
    // Get the hiddennesses of the regions.
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
      },
      tagName: {
        document: 'HTML',
        body: 'BODY',
        main: main ? main.tagName : ''
      },
      id: {
        document: document.id,
        body: body.id,
        main: main.id
      }
    };
    // Identify whether each region is really hidden.
    ['document', 'body', 'main'].forEach(element => {
      if (data.hidden[element] && ! ['block', 'flex'].includes(data.display[element])) {
        data.reallyHidden[element] = true;
      }
    });
    return data;
  });
  // For each combination of region and hiddenness:
  const standardInstances = [];
  const reportables = {
    hidden: [1, 'hidden'],
    reallyHidden: [2, 'effectively hidden'],
    visHidden: [0, 'visually hidden'],
    ariaHidden: [1, 'hidden by ARIA'],
    document: [1, 'Document', 'document.documentElement'],
    body: [1, 'Document body', 'document.body'],
    main: [0, 'main region', 'main, [role="main"]']
  };
  ['document', 'body', 'main'].forEach(region => {
    ['hidden', 'reallyHidden', 'visHidden', 'ariaHidden'].forEach(hider => {
      // If the region has that hiddenness:
      if (data[hider][region]) {
        // Add a standard instance for that combination.
        standardInstances.push({
          issueID: `allHidden-${hider}-${region}`,
          what: `${reportables[region][1]} ${reportables[hider][1]}`,
          ordinalSeverity: reportables[region][0] + reportables[hider][0] || 0,
          tagName: region.tagName,
          id: region.id,
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
  // Get the severity totals.
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
