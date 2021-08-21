// Finds and marks navigation elements that can be hover-disclosed.
exports.hover = async (page, withItems) => {
  const triggers = await page.$$('body button, body li, body nav, body [role=navigation]');
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
    if (triggers.length) {
      const firstTrigger = triggers[0];
      const firstGPJSHandle = await page.evaluateHandle(
        firstTrigger => firstTrigger.parentElement.parentElement, firstTrigger
      );
      const firstGP = firstGPJSHandle.asElement();
      const preVisibles = await firstGP.$$(':visible');
      try {
        await firstTrigger.hover({
          force: true,
          timeout: 700
        });
        const postVisibles = await firstGP.$$(':visible');
        if (postVisibles.length > preVisibles.length) {
          data.triggers++;
          const targetCount = postVisibles.length - preVisibles.length;
          data.targets += targetCount;
          if (withItems) {
            const triggerDataJSHandle = await page.evaluateHandle(args => {
              const trigger = args[0];
              const targetCount = args[1];
              return {
                tagName: trigger.tagName,
                id: trigger.id || 'NONE',
                text: trigger.textContent || `{${trigger.outerHTML.slice(0, 100)}}`,
                targetCount
              };
            }, [firstTrigger, targetCount]);
            const triggerData = await triggerDataJSHandle.jsonValue();
            data.items.push(triggerData);
          }
        }
      }
      catch (error) {
        1;
      }
      await find(triggers.slice(1));
    }
  };
  await find(triggers);
  return data;
};
