// Finds and marks navigation elements that can be hover-disclosed.
exports.hover = async (page, withItems) => {
  // Identify the elements that are likely to trigger disclosures on hover.
  const triggers = await page.$$('body button:visible, body li:visible');
  // Identify the selectors of active elements likely to be disclosed by a hover.
  const targetSelectors = 'a:visible, button:visible, input:visible, [role=menuitem]:visible';
  // Initialize the result.
  const data = {
    triggers: 0,
    targets: 0
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
      // Identify its grandparent element.
      const firstGPJSHandle = await page.evaluateHandle(
        firstTrigger => firstTrigger.parentElement.parentElement, firstTrigger
      );
      const firstGP = firstGPJSHandle.asElement();
      // Identify the visible active descendants of the grandparent.
      const preVisibles = await firstGP.$$(targetSelectors);
      try {
        // Hover over the potential trigger.
        await firstTrigger.hover();
        // Identify the visible active descendants of the grandparent.
        const postVisibles = await firstGP.$$(targetSelectors);
        // Hover over the upper-left corner of the page, to undo any current disclosures.
        await page.hover('body', {
          position: {
            x: 0,
            y: 0
          }
        });
        // If hovering disclosed any element
        if (postVisibles.length > preVisibles.length) {
          // Increment the counts of triggers and targets.
          data.triggers++;
          const targetCount = postVisibles.length - preVisibles.length;
          data.targets += targetCount;
          // If details are to be reported:
          if (withItems) {
            // Report them.
            const triggerDataJSHandle = await page.evaluateHandle(args => {
              const trigger = args[0];
              const preVisibles = args[1];
              const postVisibles = args[2];
              const newVisibles = postVisibles
              .filter(el => ! preVisibles.includes(el))
              .map(el => ({
                tagName: el.tagName,
                text: el.textContent.trim() || el.outerHTML
              }));
              return {
                tagName: trigger.tagName,
                id: trigger.id || 'NONE',
                text: trigger.textContent.trim() || `{${trigger.outerHTML.slice(0, 100)}}`,
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
