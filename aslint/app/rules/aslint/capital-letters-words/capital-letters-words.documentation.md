# capital-letters-words

## Rule id

`capital-letters-words`

## Definition

This rule detects words written in all capital letters, including text in an attribute `title` as well as using `text-transform` CSS.

## Purpose

Unless you are dealing with an acronym, there should not be any content in all caps. Some screen readers will announce the capital letters separately (like an acronym) or otherwise misleadingly emphasise the capital letters.

**Example**: CONTACT US and Contact Us will be read be screen reader differently. You can use [Pronunciation checker](https://voicenotebook.com/prononce.php) to verify how these two words are being readable.

## Test cases

### Passed

The rule passes when all of the following cases are fulfilled:

1. Text is not using all capital letters.
2. There is no `text-transform` CSS rule used.
3. Attribute `title` does not contains text written in all capital letters.

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: high
* **Disabilities Affected**:
  * Visual:
    * blindness

## Resources

Not available
