var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(cb) {
  fs.readFile(exports.paths.list, 'utf-8', function(error, data) {
    if (error) {
      console.log('readListOfUrls error');
    }
    cb(data.split('\n'));
  });
};

exports.isUrlInList = function(url, cb) {
  exports.readListOfUrls(function(data) {
    cb(data.indexOf(url) !== -1);
    // data.forEach(function(item) {
    //   cb(url === item);
    // });
  });
};

exports.addUrlToList = function(url, cb) {
  exports.isUrlInList(url, function(found) {
    if (!found) {
      var newPath = path.join(exports.paths.archivedSites, '/' + url);
      fs.appendFile(newPath, url, function(error) {
        if (error) {
          console.log('adding URL to archive error: ', error);
        }
      });
      fs.appendFile(exports.paths.list, url + '\n', function(error) {
        if (error) {
          console.log('addUrlToList appendFile error');
        }
        cb();
      });
    } else {
      console.log('found??');
    }
  });
};

exports.isUrlArchived = function(url, cb) {
  fs.readdir(exports.paths.archivedSites, function(error, files) {
    if (error) {
      console.log('Error in isUrlArchived');
    } else { // files is an array of files in that path
      cb(files.indexOf(url) !== -1);
    }
  });
};

exports.downloadUrls = function(urlArray) {
  urlArray.forEach(function(url) {
    exports.addUrlToList(url, function() {
      request(url, function(err, response, body) {
        if (!err && response.statusCode === 200) {
          exports.addUrlToList(url, function() {
            var filePath = path.join(exports.paths.archivedSites, '/' + url);
            fs.appendFile(filePath, response, function(error) {
              if (error) {
                console.log("didn't believe did you?");
              }
            });
          });
        }
      });
    });
  });
};
