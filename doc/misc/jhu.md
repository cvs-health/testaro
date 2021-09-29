# JHU procs

Some procs in Autotest implement rules developed by the Johns Hopkins University (_JHU_) Disability Health Research Center for its [Vaccine Website Accessibility](https://disabilityhealth.jhu.edu/vaccinedashboard/webaccess/) dashboard. The rule is described summarily on the cited page. Missing details were obtained from WebAIM, which conducted the testing for JHU.

The JHU-WAVE rule is defined as follows:

1.  Give each page a rank, on the basis of its error total, namely the total of its <q>Errors</q> and its <q>Contrast Errors</q>, with 0 being the best rank (i.e. the smallest total). If there is a tie for the next rank, use that rank for all of the tied pages, but then skip ranks so that the used rank plus the skipped ranks are equal in number to the number of tied pages.
2.  Give each page a rank, on the basis of its error density, namely its error total divided by the total number of its elements. Use the same rule for ties.
3.  Give each page a rank, on the basis of its alert total. Use the same rule for ties.
4.  For each page, multiply its error-total rank by 6, multiply its error-density rank by 3, and multiply its alert rank by 1.
5.  Total those three products. That total is the page’s score. The smaller the score, the better the page, according to the JHU-WAVE rule.
