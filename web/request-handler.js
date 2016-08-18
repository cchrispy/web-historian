var path = require('path');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!
var fs = require('fs');
var httpHelper = require('./http-helpers');

exports.handleRequest = function (req, res) {
  console.log('METHOD: ', req.method, 'URL: ', req.url);
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

  //determine what kind of file we are serving to the client
  var extname = path.extname(req.url);
  var contentType = 'text/html';
  switch (extname) {
  case '.js':
    contentType = 'application/json';
    break;
  case '.css':
    contentType = 'text/css';
    break;
  case '.json':
    contentType = 'application/json';
    break;
  case '.png':
    contentType = 'image/png';
    break;
  case '.jpg':
    contentType = 'image/jpg';
    break;
  case '.wav':
    contentType = 'audio/wav';
    break;
  default:
    contentType = 'text/html';
  }

  var pathname;
  // if user is asking for our index.html, give it to them
  if (req.url === '/' && req.method === 'GET') {
    pathname = path.join(__dirname, '/public/index.html');
  } else if (req.url === '/styles.css') {
    pathname = path.join(__dirname, '/public/styles.css');
  } else {
    // pathname = path.join(archive.paths.archivedSites, req.url);
    pathname = undefined;
  }

  if (req.method === 'GET' && pathname !== undefined) {
    fs.readFile(pathname, function(error, content) {
      if (error) {
        console.log('GET request error ', error);
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end();
      } else {
        // res.writeHead(200, {'Content-Type': 'text/html'});
        res.writeHead(200, {'Content-Type': contentType});
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
      // at this point we have the url that the user wants to get
      // so now we can check if we have the url in our archive and
      // serve it if we have it
      fs.stat(path.join(archive.paths.archivedSites, url), function(error, stats) {
        if (error) {
          // if there's an error then that should indicate that we don't
          // have the file and that we should add it to our list of shit to do
          if (error.code === 'ENOENT') {

            var filePath = path.join(archive.paths.archivedSites, '../sites.txt');
            fs.appendFile(filePath, url + '\n', function(error) {
              if (error) {
                console.log('appending file error: ', error);
              }
              fs.readFile(path.join(__dirname, 'public/loading.html'), function(error, content) {
                if (error) {
                  console.log('Loading file read file error ', error);
                  res.writeHead(404, {'Content-Type': 'text/html'});
                  res.end();
                } else {
                  // res.writeHead(200, {'Content-Type': 'text/html'});
                  res.writeHead(302, {'Content-Type': 'text/html'});
                  res.end(content);
                }
              });
              // var newPath = path.join(archive.paths.archivedSites, '/' + url);
              // fs.appendFile(newPath, url + '\n', function(error) {
              //   if (error) {
              //     console.log('making new file error', error);
              //   }


              // });

            });
            
          }
          
        } else {
          // if our stats object returned from fs.stats is a file,
          // that indicates that the file exists and that now we can
          // serve it to our client
          if (stats.isFile()) {
            console.log('we found the file');
            fs.readFile(path.join(archive.paths.archivedSites, '/' + url), function(error, content) {
              if (error) {
                console.log('WTF ERROR');
              } else {
                // if we found file in our archive, serve that file
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(content);
              }
            });
          }
        }
      });
      
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