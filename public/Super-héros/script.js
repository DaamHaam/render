// obtention des éléments du DOM
const questionEl = document.getElementById('question');
const submitEl = document.getElementById('submit');
const responseEl = document.getElementById('response');
const choicesEl = document.getElementsByName('choice');

let resetMode = false; // état du bouton

// fonction pour envoyer une demande à l'API via chatCompletion
async function sendRequest(content) {
    console.log("question envoyée");

    // mettre le bouton en mode RESET
    resetMode = true;
    questionEl.disabled = true;
    submitEl.style.backgroundColor = "#F2880C" // change la couleur de fond en rouge
    submitEl.style.color = "white"; // change la couleur du texte en blanc
    submitEl.textContent = 'Recommencer';

    responseEl.classList.add('loading'); // Ajout de la classe "loading" pour l'animation de chargement

    const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    const data = await response.json();

    // REPONSE
    responseEl.classList.remove('loading'); // Suppression de la classe "loading" une fois la réponse reçue

    // console.log(data.message);

    console.log("Tentative de parsing de JSON : ", data.message);

    const jsonData = JSON.parse(data.message);

    let formattedMessage = "";

    // verifie que les cles sont presentes avant
    if (jsonData.histoire) {
        formattedMessage += jsonData.histoire;
    }

    // console.log("Histoire : " + jsonData.histoire);

    if (jsonData.choixA && jsonData.choixA !== "0") {
        formattedMessage += "<br><br><b>" + "A) " + jsonData.choixA + "</b>";
    }
    // console.log("choixA : " + jsonData.choixA);

    if (jsonData.choixB && jsonData.choixB !== "0") {
        formattedMessage += "<br><br><b>" + "B) " + jsonData.choixB + "</b>";
    }

    if (jsonData.choixC && jsonData.choixC !== "0") {
        formattedMessage += "<br><br><b>" + "C) " + jsonData.choixC + "</b>";
    }
    // rajout d'une ligne vide à la fin
    formattedMessage += "<br>";
    // console.log("formattedMessage" + formattedMessage);

    // Utilisez innerHTML au lieu de textContent pour permettre le rendu du HTML
    responseEl.innerHTML = formattedMessage;

    // Copiez le texte dans le presse-papier
    // a tester sur smartphone avant d'enlever
    navigator.clipboard.writeText(formattedMessage)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            // Cela pourrait échouer si l'utilisateur refuse de permettre l'accès au presse-papier
            console.error('Could not copy text: ', err);
        });


    // Ajout pour déselectionner les boutons radio
    const radios = document.getElementsByName('choice');
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = false;
    }
}

// Add "change" event listener to each choice
for (let i = 0; i < choicesEl.length; i++) {
    choicesEl[i].addEventListener('change', () => {
        sendRequest(choicesEl[i].value);
    });
}

submitEl.addEventListener('click', async () => {

    if (resetMode) {
        // Si le bouton est en mode "RESET", réinitialiser l'interface
        resetMode = false;
        questionEl.disabled = false;
        submitEl.textContent = 'Valider';
        submitEl.style.backgroundColor = ""; // réinitialise la couleur de fond
        submitEl.style.color = ""; // réinitialise la couleur du texte
        responseEl.textContent = '';
        questionEl.value = '';
        for (let i = 0; i < choicesEl.length; i++) {
            choicesEl[i].checked = false;
        }

        // ré-initialiser la conversation
        // ré-initialiser la conversation
        fetch('/api/reset', {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => console.log(data.message))
            .catch(error => console.error('Une erreur est survenue :', error));



    } else {
        // Sinon, envoyer la question avec la valeur lettre ABC
        const content = questionEl.value;
        sendRequest(content);
    }
});

// Add "keyup" event listener to questionEl POUR TOUCHE ENTREE
questionEl.addEventListener('keyup', function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        submitEl.click();
    }
});