#  scoreAll.sh
#  Performs all reporting operations after a script is executed on a batch.
#  Arguments:
#    0. Subdirectory of the report directory.
#    1. Subdirectory of the docTemplates directory.

#!
node ./procs/report/scoreAgg $1
node ./procs/report/scoreTable $1 aut
node ./procs/report/scoreDoc $1 $2
