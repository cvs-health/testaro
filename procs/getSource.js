// ########## IMPORTS

// Module to make HTTP requests.
const fetch = require('node-fetch');
// Module to process files.
const fs = require('fs/promises');

// ########## FUNCTIONS

// Gets and returns the source of a document.
exports.getSource = async page => {
  const url = page.url();
  const scheme = url.replace(/:.+/, '');
  const data = {
    prevented: false,
    source: ''
  };
  if (scheme === 'file') {
    const filePath = url.slice(7);
    const rawPage = await fs.readFile(filePath, 'utf8');
    data.source = rawPage;
  }
  else {
    try {
      const rawPageResponse = await fetch(url);
      const rawPage = await rawPageResponse.text();
      data.source = rawPage;
    }
    catch(error) {
      console.log(`ERROR getting source of page (${error.message})`);
      data.prevented = true;
    }
  }
  return data;
};
