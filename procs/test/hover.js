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
      await firstTrigger.hover({
        force: true,
        timeout: 700
      });
      const postVisibles = await firstGP.$$(':visible');
      if (postVisibles.length > preVisibles.length) {
        data.triggers++;
        data.targets += postVisibles.length - preVisibles.length;
        if (withItems) {
          const triggerData = await page.evaluateHandle(trigger => ({
            tagName: trigger.tagName,
            id: trigger.id || 'NONE',
            text: trigger.textContent || `{${trigger.outerHTML.slice(0, 100)}}`
          }), firstTrigger);
          data.items.push(triggerData);
        }
      }
      await find(triggers.slice(1));
    }
  };
  await find(triggers);
  return data;
};
