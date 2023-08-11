# elements-not-allowed-in-head

## Rule id

`elements-not-allowed-in-head`

## Definition

This rule verifies if there are elements that shouldn't be in the `<head>` section.

## Purpose

`<head>` section contains elements that provides information of how the document should be perceived, and rendered, by web technologies. e.g. browsers, search engines, bots, screen readers, etc.

Non valid pages rely on the browser to auto-correct your code, and each browser does this differently. If your code is valid the browser has to do less processing as it doesn't have to correct any code, therefore the page will render faster and more predictable.

In order to make the code accurate processed and rendered it is recommended to have only valid HTML elements / tags in the `<head>` section.

Following elements are allowed to be in the `<head>` section:

    <title>
    <base>
    <link>
    <style>
    <meta>
    <script>
    <noscript>
    <template>

All other elements / tags are perceived as non-valid.

## Test cases

### Passed

The rule passes when only following elements / tags are specified in the `<head>` section:

    <title>
    <base>
    <link>
    <style>
    <meta>
    <script>
    <noscript>
    <template>

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

* https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML
* https://html.spec.whatwg.org/multipage/semantics.html#the-head-element
