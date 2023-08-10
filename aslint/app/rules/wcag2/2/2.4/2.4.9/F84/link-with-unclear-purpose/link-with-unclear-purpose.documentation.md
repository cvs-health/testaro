# link-with-unclear-purpose

## Rule id

`link-with-unclear-purpose`

## Definition

This rule determines if a given element `<a>` contains only following content (english only at the moment):

### List of unclear phrases

* click here
* click this
* click to learn more
* continue reading
* continue
* download more information
* download
* go
* here
* information
* learn more
* more info
* more information
* more
* read more
* right here
* see how it works
* see more
* start
* tap here
* this

## Purpose

Users of assistive technology or those with motor impairments will often access links on a page by pulling up a links list, or use shortcut keys to skip from link to link. Therefore, link text should be unique and clearly define the purpose of the link without having to read the surrounding text.

### Non-compliant example

    <a href="https://www.example.com/products">Learn more</a>

### Compliant example

    <a href="https://www.example.com/products">Learn more <span class="visuallyhidden">about our Products</span></a>

where `visuallyhidden` represent CSS styles to hide text visually, but still expose it to Assistive Technologies.

Example of `visuallyhidden` implementation:

    .visuallyhidden {
      position: absolute !important;
      height: 1px;
      width: 1px;
      overflow: hidden;
      clip: rect(1px, 1px, 1px, 1px);
      clip-path: none;
      top: -1px;
  }

## Test cases

### Passed

The rule passes when there is no `<a>` element that contains only content defined in the [list of unclear phrases](#list-of-unclear-phrases).

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: info
* **Disabilities Affected**:
  * Visual:
    * blindness

## Resources

* [G53: Identifying the purpose of a link using link text combined with the text of the enclosing sentence](https://www.w3.org/TR/WCAG20-TECHS/G53.html)
* [G91: Providing link text that describes the purpose of a link](https://www.w3.org/TR/WCAG20-TECHS/G91.html)
* [Understanding Success Criterion 2.4.9: Link Purpose (Link Only)](https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-link-only)
* [Don't say \"click here\"; not everyone will be clicking - Quality Web Tips](https://www.w3.org/QA/Tips/noClickHere)
