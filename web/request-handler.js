var path = require('path');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!
var fs = require('fs');
var httpHelper = require('./http-helpers');

exports.handleRequest = function (req, res) {
  // archive.readListOfUrls(function(data) {
  //   console.log(data);
  // });

  // var exists = false;
  // archive.isUrlInList('example1.com', function(item) {
  //   if (item === 'example1.com') {
  //     exists = true;
  //   }
  // });
  // archive.isUrlInList('example1.com');

  // console.log(archive.isUrlInList('example2.com', function(url, data) {
  //   return data.indexOf(url) !== -1;
  // }));

  var pathname;
  // req.url = /www.google.com
  if (req.url === '/' && req.method === 'GET') {
    pathname = path.join(__dirname, '/public/index.html');
  } else {
    pathname = path.join(archive.paths.archivedSites, req.url);
  }

  if (req.method === 'GET') {
    fs.readFile(pathname, function(error, content) {
      if (error) {
        console.log('error reading file: GETREQUEST');
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end();
      } else {
        // console.log('PATHNAME: ', pathname);
        // console.log('CONTENT: ', content);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(content);
      }
    });   
  } else if (req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      var url = body.split('=')[1];
      var filePath = path.join(archive.paths.archivedSites, '../sites.txt');
      fs.appendFile(filePath, url + '\n', function(error) {
        if (error) {
          console.log('appending file error: ', error);
        }
      });
      var newPath = path.join(archive.paths.archivedSites, '/' + url);
      fs.appendFile(newPath, url + '\n', function(error) {
        if (error) {
          console.log('making new file error', error);
        }
      });
      res.writeHead(302, {'Location': newPath, 'Content-Type': 'text/html'});
      res.end();
    });
    req.on('error', function(error) {
      console.log('post request error: ', error);
    });



    // var ext = path.extname(pathname);
    // if (ext === '') {
    //   // pathname is a directory
    // } else if (ext !== '') {
    //   // pathname is a file
    // }
    // console.log('we are posting at ', pathname);
    // //check if url is in the list, writefile if it isnt
    // fs.appendFile(pathname, req.url, 'utf8', function(error) {
    //   console.log('balhablah');
    //   if (error) {
    //     console.log('Error writing file ', error);
    //   }
    // });
  }
  // res.end(archive.paths.list);
};