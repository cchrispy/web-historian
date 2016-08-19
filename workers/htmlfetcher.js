// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.

// worker will look at the list to see all the things he needs to do
// for each website, he'll send a get request to that website and
// download the website.
// then, the worker will 
var archive = require('../helpers/archive-helpers.js');



exports.getHTML = function() {
  console.log('work work');
  archive.downloadUrls();
};
