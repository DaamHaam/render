const http = require('http');

function handleRequest(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World du serveur !\n');
}

module.exports = handleRequest;
