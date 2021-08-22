// Finds and marks navigation elements that can be hover-disclosed.
exports.hover = async (page, withItems) => {
  // Identify the elements that are likely to trigger disclosures on hover.
  const triggers = await page.$$(
    'body button:visible, body li:visible, body [onmouseenter]:visible, body [onmouseover]:visible'
  );
  // Identify the selectors of active elements likely to be disclosed by a hover.
  const targetSelectors = 'a:visible, button:visible, input:visible, [role=menuitem]:visible';
  // Initialize the result.
  const data = {
    totals: {
      triggers: 0,
      targets: 0
    }
  };
  if (withItems) {
    data.items = [];
  }
  // FUNCTION DEFINITION START
  // Recursively finds and reports triggers and targets.
  const find = async triggers => {
    // If any potential disclosure triggers remain:
    if (triggers.length) {
      // Identify the first of them.
      const firstTrigger = triggers[0];
      const tagNameJSHandle = await firstTrigger.getProperty('tagName');
      const tagName = await tagNameJSHandle.jsonValue();
      // Identify it or, if it is a link or button, its parent element.
      let root = firstTrigger;
      if (['a', 'button'].includes(tagName)) {
        const rootJSHandle = await page.evaluateHandle(
          firstTrigger => firstTrigger.parentElement, firstTrigger
        );
        root = rootJSHandle.asElement();
      }
      // Identify the visible active descendants.
      const preVisibles = await root.$$(targetSelectors);
      try {
        // Hover over the potential trigger.
        await firstTrigger.hover({timeout: 700});
        // Wait for any delayed and/or slowed hover reaction. (Some test pages require 290+.)
        await page.waitForTimeout(350);
        await root.waitForElementState('stable');
        // Identify the visible active descendants.
        const postVisibles = await root.$$(targetSelectors);
        // If hovering disclosed any element:
        if (postVisibles.length > preVisibles.length) {
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
          const targetCount = postVisibles.length - preVisibles.length;
          data.totals.targets += targetCount;
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
                newVisibles
              };
            }, [firstTrigger, preVisibles, postVisibles]);
            const triggerData = await triggerDataJSHandle.jsonValue();
            data.items.push(triggerData);
          }
        }
      }
      catch (error) {
        1;
      }
      // Process the remaining potential triggers.
      await find(triggers.slice(1));
    }
  };
  // Find and document the hover-triggered disclosures.
  await find(triggers);
  // Return the result.
  return data;
};
