// import de la fonction getCompletion
// import { getCompletion } from './chatCompletion.mjs';

// obtention des éléments du DOM
const questionEl = document.getElementById('question');
const submitEl = document.getElementById('submit');
const responseEl = document.getElementById('response');


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
    responseEl.textContent = "PAS DE CALCULS ENCORE" + data.message;
});
