var path = require('path');
var archive = require('../helpers/archive-helpers');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var httpHelper = require('./http-helpers');

exports.handleRequest = function (req, res) {
  console.log('METHOD: ', req.method, 'URL: ', req.url);
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
  if (req.url === '/' && req.method === 'GET') {
    pathname = path.join(__dirname, '/public/index.html');
  } else if (req.url === '/styles.css') {
    pathname = path.join(__dirname, '/public/styles.css');
  } else {
    pathname = undefined;
  }

  if (req.method === 'GET' && pathname !== undefined) {
    fs.readFileAsync(pathname).then(function(val) {
      res.writeHead(200, {'Content-Type': contentType});
      res.end(val);
    }).catch(function(err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end();
    });
  } else if (req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      var url = body.split('=')[1];
      archive.isUrlArchived(url).then(function(found) {
        if (!found) {
          archive.addUrlToList(url);
          fs.readFileAsync(path.join(__dirname, 'public/loading.html')).then(function(val) {
            res.writeHead(302, {'Content-Type': 'text/html'});
            res.end(val);
          }).catch(function(err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end();
          });
        } else {
          fs.readFileAsync(path.join(archive.paths.archivedSites, '/' + url)).then(function(val) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(val);
          }).catch(function(error) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end();
          });
        }
      });

    });
    req.on('error', function(error) {
      console.log('post request error: ', error);
    });
  }
};