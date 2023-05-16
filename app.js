const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');


// route vers la fonction chatcompletion
const { getCompletion, resetConversation } = require('./chatCompletion');

// Pour analyser le corps des requêtes JSON
app.use(express.json());


// Pour servir les fichiers statiques dans le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Pour servir les fichiers statiques dans le dossier racine
// app.use(express.static(path.join(__dirname)));

// Route pour la page d'accueil (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'page4', 'indexRacine.html'));
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

app.post('/api/reset', (req, res) => {
  try {
    resetConversation();
    res.status(200).json({ message: 'La conversation a été réinitialisée' });
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la réinitialisation de la conversation' });
  }
});




// crée une route pour récupérer les noms des répertoires dans le dossier 'public'
app.get('/api/directories', (req, res) => {
  fs.readdir(path.join(__dirname, 'public'), (err, files) => {
    if (err) {
      res.status(500).send('Erreur lors de la lecture des répertoires');
    } else {
      const directories = files.filter(file => fs.statSync(path.join(__dirname, 'public', file)).isDirectory());
      res.json(directories);
    }
  });
});

// Ajoutez ici des routes pour d'autres pages HTML, si nécessaire
// app.get('/autre-page', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'autre-page.html'));
// });

module.exports = app;