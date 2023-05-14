// version du tutoriel render : utilise la syntaxe des commonjs alors que Ecma script (es modules)
// est plus récente (pour importer des modules)
const http = require('http');
const app = require('./app');

// import http from 'http';
// import app from './app';

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Started on port ${port}`);
});

