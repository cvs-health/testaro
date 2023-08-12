# font-style-italic

## Rule id

`font-style-italic`

## Definition

This rule verifies if there is defined `font-style` type `italic` for a text with length > 80 chars.

## Purpose

[WCAG Understanding Guideline 3.1](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning.html) includes an advisory technique for "avoiding chunks of italic text". Similarly [WebAIM advises](https://webaim.org/articles/evaluatingcognitive/#readability) as follows: "Do not use italics or bold on long sections of text", but at the same time "use various stylistic elements (italics, bold, color, brief animation, or differently-styled content) to highlight important content".

This rule checks 2 cases:

* Determine reasonable text length - must be < 80 chars.
* Determine if element has defined `font-style` type `italic`.

## Test cases

### Passed

The rule passes when specified element contains text with length > 80 chars and have no defined style `font-style` type `italic`.

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

* https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning.html
* https://webaim.org/articles/evaluatingcognitive/#readability
