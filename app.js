const express = require('express');
const app = express();
const path = require('path');

// route vers la fonction chatcompletion
const { getCompletion } = require('./chatCompletion.js');

// Pour analyser le corps des requêtes JSON
app.use(express.json());


// Pour servir les fichiers statiques dans le dossier 'public'
// app.use(express.static(path.join(__dirname, 'public')));

// Pour servir les fichiers statiques dans le dossier racine
app.use(express.static(path.join(__dirname)));

// Route pour la page d'accueil (index.html)
// route à remettre après test racine
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'indexRacine.html'));
});

// Route pour l'API OpenAI
app.post('/api/completion', async (req, res) => {
  const content = req.body.content;
  try {
    const message = await getCompletion(content);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la communication avec OpenAI' });
  }
});


// Ajoutez ici des routes pour d'autres pages HTML, si nécessaire
// app.get('/autre-page', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'autre-page.html'));
// });

module.exports = app;