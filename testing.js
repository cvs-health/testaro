/*
  testing.js
*/

// let out = 'something';

/*
const actions = list => {
  if (list.length) {
    console.log(`The list length is now ${list.length}`);
    out = list[0];
    console.log(`out is now ${out}`);
    if (once) {
      console.log(`once is turned on, so returning ${out}`);
    }
    else {
      actions(list.slice(1));
    }
  }
  else {
    console.log('The list is now empty');
    console.log(`About to return ${out} from actions`);
    return out;
  }
};

const takeActions = () => {
  const list = ['a', 'b', 'c'];
  out = actions(list);
  console.log(`The output should be c and is ${out}`);
};

takeActions();
*/

const actions = list => {
  if (list.length > 1) {
    return actions(list.slice(1));
  }
  else if (list.length === 1) {
    return list[0];
  }
  else {
    return 'NOTHING';
  }
};

const takeActions = () => {
  console.log(`The output is ${actions(['a', 'b', 'c'])}`);
};

takeActions();
