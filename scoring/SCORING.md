# Autotest scoring

Accessibility test automation

## Introduction

The basics of scoring in Autotest are described in the `README.md` file.

Scoring procs are located in the `procs/score` directory.

## Strategy

A scoring proc computes a score from the results of the tests performed by a script. The greater the score, the worse the artifact is deemed to be.

The total score is the sum of the scores produced by the individual tests.

Some documents are implemented in such a way that some tests are prevented from being conducted on them. When that occurs, the proc can **infer** a score.

The scoring is intended to estimate the over-all inaccessibility of a document. Inaccessibility is understood to arise from design and implementation facts that fail to conform to accessibility standards and/or best practices.

## Formulas

When a script commands Autotest to use a scoring proc to compute scores, the report from the script execution includes an act with type `score`. Its `result.rules` property provides summaries of the formulas.
