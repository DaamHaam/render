const express = require('express');
const app = express();
const path = require('path');

// Pour servir les fichiers statiques dans le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la page d'accueil (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ajoutez ici des routes pour d'autres pages HTML, si nécessaire
// app.get('/autre-page', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'autre-page.html'));
// });

module.exports = app;
