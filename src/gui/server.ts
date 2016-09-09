import * as http from 'http';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';

export class Server {
  private static mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.eot': 'application/vnd.ms-fontobject',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff',
    '.ttf': 'font/ttf',
    '.otf': 'font/opentype',
    '.wav': 'audio/wav'
  };

  /**
   * Create a simple static file server.
   *
   * @static
   * @param {string} [base] Base folder
   * @param {number} [port=8080]
   */
  static create(base: string, port = 8080) {
    http.createServer((req, res) => {
      console.log('request starting...');

      var filePath = base + (req.url === '/' ? '/index.html' : req.url);
      let i = filePath.indexOf('?');
      if (i > 0)
        filePath = filePath.substr(0, i - 1);

      var extname = path.extname(filePath);
      var contentType = 'text/html';
      if (Server.mimeTypes.hasOwnProperty(extname)) contentType = Server.mimeTypes[extname];

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            fs.readFile(base + '/404.html', (error, content) => {
              res.writeHead(200, { 'Content-Type': contentType });
              res.end(content, 'utf-8');
            });
          } else {
            res.writeHead(500);
            res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            res.end();
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
      console.log(`Server running at http://127.0.0.1:${port}/`);
    }).listen(port);
  }
}
