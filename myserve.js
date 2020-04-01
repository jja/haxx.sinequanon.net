// metalsmith plugin providing a simple http server for the static files, based on:
//   https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http
//   https://gist.githubusercontent.com/amejiarosario/53afae82e18db30dadc9bc39035778e5/raw/21c6ccd9f2be7cdaaaa7d837d3d8271db4984d0f/static_server.js
//   https://stackabuse.com/node-http-servers-for-static-file-serving/
//   https://github.com/mayo/metalsmith-serve/blob/master/lib/index.js

// ***** This is not security-hardened nor robust for even small loads. IT IS NOT A PUBLIC SERVER.
// This is meant just for quick simple basic local preview of the static site.

'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

var serve = function(port, rootDir) {
  if (!port) port = 8080;

  var f = function(files, metalsmith, nextstep) {
    http.createServer(function (req, res) {
      console.log(`${req.method} ${req.url}`);

      // file extension to MIME type
      const mimes = {
        '.css': 'text/css',
        '.gif': 'image/gif',
        '.html': 'text/html',
        '.ico': 'image/x-icon',
        '.jpg': 'image/jpeg',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.txt': 'text/plain',
      };

      if (!rootDir) rootDir = metalsmith.destination();
      if (!rootDir) rootDir = '.';

      const resolvedBase = path.resolve(rootDir);
      const safeSuffix = path.normalize(url.parse(req.url).path).replace(/^([\.\\])+/, '').replace(/([\/\\])+/,'/').toString();
      var pathname = path.join(resolvedBase, safeSuffix);
      var ext = path.parse(pathname).ext;

      fs.stat(pathname, (err,stats) => {
        if (err && err.code === 'ENOENT') {
          console.log
          res.statusCode = 404;
          res.end('Not found');
          return;
        }
        if (stats.isDirectory()) {
          if (!pathname.endsWith('/')) pathname += '/';
          pathname += 'index.html';
          ext = '.html';
          console.log('  found directory, trying ' + pathname);
        }

        fs.readFile(pathname, (err, data) => {
          if (err && err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('Not found');
          } else if (err) {
            console.log(`Error getting the file: ${err}.`);
            res.statusCode = 500;
            res.end('Error');
          } else {
            res.setHeader('Content-type', mimes[ext] || 'text/plain');
            res.end(data);
          }
        });

      });

    }).listen(parseInt(port));

    console.log("Now serving at http://localhost:"+port)
    nextstep();
  };

  return f;
};

module.exports = serve;
