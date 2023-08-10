# empty-title-attribute

## Rule id

`empty-title-attribute`

## Definition

This rule verifies if there are elements that have an attribute `title` with an empty value. This includes also whitespaces.

## Purpose

`title` attribute should not be empty. This will ensure that the value of `title` will be processed in a predictable way. As a side effect removing an empty value of `title` attribute will make the code smaller, which means less data to transfer and faster processing by e.g. the browser.

Following elements are being skip while evaluating this rule:

      <img/>,
      <html>,
      <head>,
      <title>,
      <body>,
      <link/>,
      <meta>,
      <title>,
      <style>,
      <script>,
      <noscript>,
      <iframe>,
      <br/>,
      <hr/>

## Test cases

### Passed

The rule passes when element have an attribute `title` with non-empty value. This includes also whitespaces.

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: low
* **Disabilities Affected**:
  * Visual:
    * blindness

## Resources

* https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title#accessibility_concerns
