// Returns an array of the properties of a JSHandle.
exports.jsHandleProps = async (jsHandle, areElements) => {
  // Get the properties of the JSHandle.
  const jsHandleMap = await jsHandle.getProperties();
  // Initialize the result.
  const props = [];
  // For each property:
  for (let i = 0; i < jsHandleMap.size; i++) {
    // Identify it as a JSHandle.
    const propHandle = jsHandleMap.get(i.toString());
    // Add its value to the result.
    if (areElements[i]) {
      props.push(propHandle ? await propHandle.asElement() : null);
    }
    else {
      props.push(propHandle ? await propHandle.jsonValue() : null);
    }
  }
  // Return the result.
  return props;
};
