/*
  batchify.js
  Creates a set of scripts from a script and a batch.
*/

// Converts a script to a batch-based array of scripts.
exports.batchify = (script, batch, timeStamp) => {
  const {hosts} = batch;
  const specs = hosts.map(host => {
    const newScript = JSON.parse(JSON.stringify(script));
    newScript.commands.forEach(command => {
      if (command.type === 'url') {
        command.which = host.which;
        command.what = host.what;
      }
    });
    const spec = {
      id: `${timeStamp}-${host.id}`,
      host,
      script: newScript
    };
    return spec;
  });
  return specs;
};
