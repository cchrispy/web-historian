var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');
var Promise = require('bluebird');

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

exports.readListOfUrls = new Promise(function(resolve, reject) {
  fs.readFile(exports.paths.list, 'utf-8', function(error, data) {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  });
}).then(function(data) {
  console.log(data);
  return _.filter(data.split('\n'), function(url) {
    return url !== '';
  });
}).catch(function(error) {
  console.log('error reading URL list', error);
});

exports.isUrlInList = function(url) {
  return exports.readListOfUrls.then(function(listOfUrls) {
    return listOfUrls.indexOf(url) !== -1;
  });
};

exports.addUrlToList = function(url) {
  exports.isUrlInList(url).then(function(found) {
    if (!found) {
      console.log('LALALALALALALALALALALALALALALA', url);
      fs.appendFile(exports.paths.list, url + '\n', function(error) {
        if (error) {
          console.log(error);
        }
      });
    }
  });
};

exports.isUrlArchived = function(url) {
  return new Promise(function(resolve, reject) {
    fs.readdir(exports.paths.archivedSites, function(error, files) {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  }).then(function(files) {
    return files.indexOf(url) !== -1;
  });
};

exports.downloadUrls = function() {
  exports.readListOfUrls.then(function(urlArray) {
    urlArray.forEach(function(url) {
      var newPath = path.join(exports.paths.archivedSites, '/' + url);
      exports.isUrlArchived(url).then(function(found) {
        if (!found) {
          request('https://' + url, function(error, response, body) {
            if (error) {
              console.log('Error downloading URL');
            } else if (!error && response.statusCode === 200) {
              console.log(body);
              fs.writeFile(newPath, body, function(error) {
                if (error) {
                  console.log('downloadUrls appendFile error');
                }
              });
            }
          });
        }
      });
    });
  });
};
