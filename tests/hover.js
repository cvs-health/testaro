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
      madeVisible: 0,
      opacityChanged: 0,
      opacityAffected: 0,
      unhoverables: 0
    }
  };
  if (withItems) {
    data.items = {
      triggers: [],
      unhoverables: []
    };
  }
  let triggerTag = '';
  // FUNCTION DEFINITION START
  // Recursively finds and reports triggers and targets.
  const find = async triggers => {
    // If any potential disclosure triggers remain:
    if (triggers.length) {
      // Identify the first of them.
      const firstTrigger = triggers[0];
      const tagNameJSHandle = await firstTrigger.getProperty('tagName')
      .catch(error => {
        console.log(`ERROR getting trigger tag name (${error.message})`);
        return '';
      });
      if (tagNameJSHandle) {
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
        // Identify the visible active descendants of the root before the hover.
        const preVisibles = await root.$$(targetSelectors);
        // Identify all the descendants of the root.
        const descendants = await root.$$('*');
        // Identify their opacities before the hover.
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
            elementsChecked++ < 10 || tagName !== triggerTag || isController ? 1200 : 200
          );
          await root.waitForElementState('stable');
          // Identify the visible active descendants of the root during the hover.
          const postVisibles = await root.$$(targetSelectors);
          // Identify the opacities of the descendants of the root during the hover.
          const postOpacities = await page.evaluate(
            elements => elements.map(el => window.getComputedStyle(el).opacity), descendants
          );
          // Identify the elements with opacity changes.
          const opacityTargets = descendants
          .filter((descendant, index) => postOpacities[index] !== preOpacities[index]);
          // Count them and their descendants.
          const opacityAffected = opacityTargets.length
            ? await page.evaluate(elements => elements.reduce(
              (total, current) => total + 1 + current.querySelectorAll('*').length, 0
            ), opacityTargets)
            : 0;
          // If hovering disclosed any element or changed any opacity:
          if (postVisibles.length > preVisibles.length || opacityAffected) {
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
            const madeVisible = postVisibles.length - preVisibles.length;
            data.totals.madeVisible += madeVisible;
            data.totals.opacityChanged += opacityTargets.length;
            data.totals.opacityAffected += opacityAffected;
            // If details are to be reported:
            if (withItems) {
              // Report them.
              const triggerDataJSHandle = await page.evaluateHandle(args => {
                // Returns the text of an element.
                const textOf = (element, limit) => {
                  const text = element.textContent.trim() || element.outerHTML.trim();
                  return text.replace(/\s{2,}/sg, ' ').slice(0, limit);
                };
                const trigger = args[0];
                const preVisibles = args[1];
                const postVisibles = args[2];
                const madeVisible = postVisibles
                .filter(el => ! preVisibles.includes(el))
                .map(el => ({
                  tagName: el.tagName,
                  text: textOf(el, 50)
                }));
                const opacityChanged = args[3].map(el => ({
                  tagName: el.tagName,
                  text: textOf(el, 50)
                }));
                return {
                  tagName: trigger.tagName,
                  id: trigger.id || '',
                  text: textOf(trigger, 50),
                  madeVisible,
                  opacityChanged
                };
              }, [firstTrigger, preVisibles, postVisibles, opacityTargets]);
              const triggerData = await triggerDataJSHandle.jsonValue();
              data.items.triggers.push(triggerData);
            }
          }
        }
        catch (error) {
          console.log('ERROR hovering');
          // Returns the text of an element.
          const textOf = async (element, limit) => {
            let text = await element.textContent();
            text = text.trim() || await element.innerHTML();
            return text.trim().replace(/\s*/sg, '').slice(0, limit);
          };
          data.totals.unhoverables++;
          data.items.unhoverables.push({
            tagName: tagName,
            id: firstTrigger.id || '',
            text: await textOf(firstTrigger, 50)
          });
        }
        triggerTag = tagName;
      }
      // Process the remaining potential triggers.
      await find(triggers.slice(1));
    }
  };
  // Find and document the hover-triggered disclosures.
  await find(triggers);
  // Return the result.
  return {result: data};
};
