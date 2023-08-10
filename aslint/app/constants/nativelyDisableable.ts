/*
 * W3C and WHATWG https://html.spec.whatwg.org/#enabling-and-disabling-form-controls:-the-disabled-attribute
 * W3C http://www.w3.org/TR/html5/disabled-elements.html#disabled-elements
 */

export const NATIVELY_DISABLEABLE: Readonly<{ [key: string]: boolean }> = Object.freeze({
  BUTTON: true,
  FIELDSET: true,
  INPUT: true,
  OPTGROUP: true,
  OPTION: true,
  SELECT: true,
  TEXTAREA: true
});
