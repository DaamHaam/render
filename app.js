const express = require('express');
const path = require('path');
const app = express();

const ip = require('ip');
const port = 3000; // Remplacez 3000 par le numéro de port que vous utilisez pour votre serveur Node.js

console.log("IP : " + ip.address() + ":" + port);

app.use(express.static('public'));

app.get('/P1TD', function(req, res) {
  res.sendFile(path.join(__dirname, 'P1TD', 'index.html'));
});

app.get('/script.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'P1TD', 'js', 'script.js'));
});

app.get('/manifest.json', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'P1TD', 'manifest.json'));
});

app.get('/sw.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'P1TD', 'sw.js'));
});

//exos patients
app.get('/P2EP', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'P2EP', 'index.html'));
});

app._router.stack.forEach(function(route) {
  if (route.route && route.route.path !== '/') {
    console.log(`http://${ip.address()}:${port}${route.route.path}`);
  }
});

app.listen(port, function() {
  console.log('Server started on port ' + port);
});
