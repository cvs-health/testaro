// Finds and reports navigation elements that can be hover-disclosed.
exports.reporter = async (page, withItems) => {
  // Initialize a counter.
  let elementsChecked = 0;
  // Identify the elements that are likely to trigger disclosures on hover.
  const triggers = await page.$$(
    'body a:visible, body button:visible, body li:visible, body [onmouseenter]:visible, body [onmouseover]:visible'
  )
  .catch(error => {
    console.log(`ERROR getting hover triggers (${error.message})`);
    return [];
  });
  // Identify the selectors of active elements likely to be disclosed by a hover.
  const targetSelectors = ['a', 'button', 'input', '[role=menuitem]', 'span']
  .map(selector => `${selector}:visible`)
  .join(', ');
  // Initialize the result.
  const data = {
    totals: {
      triggers: 0,
      visibilityTargets: 0,
      opacityTargets: 0
    }
  };
  if (withItems) {
    data.items = [];
  }
  let triggerTag = '';
  // FUNCTION DEFINITION START
  // Recursively finds and reports triggers and targets.
  const find = async triggers => {
    // If any potential disclosure triggers remain:
    if (triggers.length) {
      // Identify the first of them.
      const firstTrigger = triggers[0];
      const firstTriggerTag = firstTrigger.tagName;
      const tagNameJSHandle = await firstTrigger.getProperty('tagName');
      const tagName = await tagNameJSHandle.jsonValue();
      // Identify the root of a subtree likely to contain disclosed elements.
      let root = firstTrigger;
      if (['A', 'BUTTON'].includes(tagName)) {
        const rootJSHandle = await page.evaluateHandle(
          firstTrigger => {
            const parent = firstTrigger.parentElement;
            if (parent) {
              return parent.parentElement || parent;
            }
            else {
              return firstTrigger;
            }
          },
          firstTrigger
        );
        root = rootJSHandle.asElement();
      }
      // Identify the visible active descendants of the root.
      const preVisibles = await root.$$(targetSelectors);
      // Identify all the descendants of the root.
      const descendants = await root.$$('*');
      // Identify their opacities.
      const preOpacities = await page.evaluate(
        elements => elements.map(el => window.getComputedStyle(el).opacity), descendants
      );
      try {
        // Hover over the potential trigger.
        await firstTrigger.hover({timeout: 700});
        // Identify whether it controls other elements.
        const isController = await page.evaluate(
          element => element.ariaHasPopup || element.hasAttribute('aria-controls'), firstTrigger
        );
        // Wait for any delayed and/or slowed hover reaction if likely.
        await page.waitForTimeout(
          elementsChecked++ < 10 || firstTriggerTag !== triggerTag || isController ? 1200 : 200
        );
        await root.waitForElementState('stable');
        // Identify the visible active descendants.
        const postVisibles = await root.$$(targetSelectors);
        // Identify the opacities of the descendants of the root.
        const postOpacities = await page.evaluate(
          elements => elements.map(el => window.getComputedStyle(el).opacity), descendants
        );
        // Identify the elements with opacity changes.
        const opacityChangers = descendants
        .filter((descendant, index) => postOpacities[index] !== preOpacities[index]);
        const opacityTargetCount = opacityChangers.length
          ? await page.evaluate(elements => elements.reduce(
            (total, current) => total + 1 + current.querySelectorAll('*').length, 0
          ), opacityChangers)
          : 0;
        // If hovering disclosed any element or changed any opacity:
        if (postVisibles.length > preVisibles.length || opacityTargetCount) {
          // Preserve the lengthened reaction wait, if any, for the next 5 tries.
          if (elementsChecked < 11) {
            elementsChecked = 5;
          }
          // Hover over the upper-left corner of the page, to undo any hover reactions.
          await page.hover('body', {
            position: {
              x: 0,
              y: 0
            }
          });
          // Wait for any delayed and/or slowed hover reaction.
          await page.waitForTimeout(200);
          await root.waitForElementState('stable');
          // Increment the counts of triggers and targets.
          data.totals.triggers++;
          const visibilityTargetCount = postVisibles.length - preVisibles.length;
          data.totals.visibilityTargets += visibilityTargetCount;
          data.totals.opacityTargets += opacityTargetCount;
          // If details are to be reported:
          if (withItems) {
            // Report them.
            const triggerDataJSHandle = await page.evaluateHandle(args => {
              const textOf = (element, limit) => {
                let text = element.textContent.trim();
                if (text) {
                  text = text.replace(/\n.*/s, '');
                }
                return (text ? text : element.outerHTML).slice(0, limit);
              };
              const trigger = args[0];
              const preVisibles = args[1];
              const postVisibles = args[2];
              const opacityChangers = args[3].map(el => ({
                tagName: el.tagName,
                text: textOf(el, 50)
              }));
              const newVisibles = postVisibles
              .filter(el => ! preVisibles.includes(el))
              .map(el => ({
                tagName: el.tagName,
                text: textOf(el, 50)
              }));
              return {
                tagName: trigger.tagName,
                id: trigger.id || 'NONE',
                text: textOf(trigger, 50),
                newVisibles,
                opacityChangers
              };
            }, [firstTrigger, preVisibles, postVisibles, opacityChangers]);
            const triggerData = await triggerDataJSHandle.jsonValue();
            data.items.push(triggerData);
          }
        }
      }
      catch (error) {
        1;
      }
      triggerTag = firstTriggerTag;
      // Process the remaining potential triggers.
      await find(triggers.slice(1));
    }
  };
  // Find and document the hover-triggered disclosures.
  await find(triggers);
  // Reload the page to undo the hover-triggered content changes.
  await require('../procs/test/reload').reload(page);
  // Return the result.
  return {result: data};
};
