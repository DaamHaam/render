// import de la fonction getCompletion
// import { getCompletion } from './chatCompletion.mjs';

// obtention des éléments du DOM
const questionEl = document.getElementById('question');
const submitEl = document.getElementById('submit');
const responseEl = document.getElementById('response');

// gestionnaire d'événement pour le bouton submit
// ancienne méthode sans fetch
// submitEl.addEventListener('click', async () => {
//     // obtenir la question
//     const question = questionEl.value;
//     // obtenir la réponse de GPT-3
//     console.log("question envoyée");
//     const response = await getCompletion(question);
//     // afficher la réponse
//     console.log("réponse affichée");

//     responseEl.textContent = response;
// });


submitEl.addEventListener('click', async () => {
    console.log("question envoyée");
    const content = questionEl.value;
    const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    console.log("réponse reçue");
    const data = await response.json();
    responseEl.textContent = data.message;
});
