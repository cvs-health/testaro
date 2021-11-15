/*
  scoreAll.sh
  Performs all reporting operations after a script is executed on a batch.
  Arguments:
    0. Subdirectory of the report directory.
    1. Subdirectory of the docTemplates directory.
*/
node ./scoreAgg process.argv[2]
node ./scoreTable process.argv[2] aut
node ./scoreDoc process.argv[2] process.argv[3]
