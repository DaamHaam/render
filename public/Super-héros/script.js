// obtention des éléments du DOM
const questionEl = document.getElementById('question');
const submitEl = document.getElementById('submit');
const responseEl = document.getElementById('response');
// anciens boutons
const radioChoicesEl = document.getElementsByName('choice');

let resetMode = false; // état du bouton

const waitMessage = "-- enfin, pour l'instant, il faut attendre un peu :)";

const appName = "Fantas-IA";

let indexQuestion = 0;

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

    // si première question
    if (indexQuestion === 0) {
        responseEl.innerHTML = getRandomLoadingMessage() + '<br><br><strong>' + '</strong><br><br>' + waitMessage;
    }
    indexQuestion += 1;

    // responseEl.classList.add('loadingTXT'); // Ajout de la classe "loading" pour l'animation de chargement


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

    // Copiez le texte dans le presse-papier
    // copyClipboard();

    const jsonData = JSON.parse(data.message);

    let formattedMessage = "";

    // verifie que les cles sont presentes avant
    if (jsonData.histoire) {
        formattedMessage += jsonData.histoire;
    }

    // console.log("Histoire : " + jsonData.histoire);


    // NOUVELLE FACON
    if (jsonData.choixA && jsonData.choixA !== "0") {
        formattedMessage += "<br><br><div id='choixA' class='choiceN'><b>" + jsonData.choixA + "</b></div>";
    }
    if (jsonData.choixB && jsonData.choixB !== "0") {
        formattedMessage += "<br><div id='choixB' class='choiceN'><b>" + jsonData.choixB + "</b></div>";
    }
    if (jsonData.choixC && jsonData.choixC !== "0") {
        formattedMessage += "<br><div id='choixC' class='choiceN'><b>" + jsonData.choixC + "</b></div><br>";
    }

    // Utilisez innerHTML au lieu de textContent pour permettre le rendu du HTML
    responseEl.innerHTML = formattedMessage;

    // Ajouter un écouteur d'événements click à chaque choix
    // const choicesElN = document.getElementsByClassName('choiceN');
    // for (let i = 0; i < choicesElN.length; i++) {
    //     choicesElN[i].addEventListener('click', () => {
    //         sendRequest(choicesElN[i].id.slice(-1));  // Envoie la dernière lettre de l'id (A, B ou C)
    //     });
    // }

    // Ajouter un écouteur d'événements click à chaque choix
    const choices = document.getElementsByClassName('choiceN');
    for (let i = 0; i < choices.length; i++) {
        choices[i].addEventListener('click', () => {
            // Envoie la dernière lettre de l'id (A, B ou C) à sendRequest
            sendRequest(choices[i].id.slice(-1));

            // Supprime la classe "selected" de tous les choix
            for (let j = 0; j < choices.length; j++) {
                choices[j].classList.remove('selected');
            }

            // Ajoute la classe "selected" au choix cliqué
            choices[i].classList.add('selected');

            // Désactive tous les choix
            for (let j = 0; j < choices.length; j++) {
                choices[j].style.pointerEvents = 'none';
            }

        });
    }


    // A R E

    // if (jsonData.choixA && jsonData.choixA !== "0") {
    //     formattedMessage += "<br><br><b>" + "A) " + jsonData.choixA + "</b>";
    // }
    // // console.log("choixA : " + jsonData.choixA);

    // if (jsonData.choixB && jsonData.choixB !== "0") {
    //     formattedMessage += "<br><br><b>" + "B) " + jsonData.choixB + "</b>";
    // }

    // if (jsonData.choixC && jsonData.choixC !== "0") {
    //     formattedMessage += "<br><br><b>" + "C) " + jsonData.choixC + "</b>";
    // }
    // // rajout d'une ligne vide à la fin
    // formattedMessage += "<br>";
    // // console.log("formattedMessage" + formattedMessage);

    // // Utilisez innerHTML au lieu de textContent pour permettre le rendu du HTML
    // responseEl.innerHTML = formattedMessage;


    // // Ajout pour déselectionner les boutons radio
    // const radios = document.getElementsByName('choice');
    // for (let i = 0; i < radios.length; i++) {
    //     radios[i].checked = false;
    // }







}

// Add "change" event listener to each choice
// for (let i = 0; i < choicesEl.length; i++) {
//     choicesEl[i].addEventListener('change', () => {
//         sendRequest(choicesEl[i].value);
//     });
// }
function getRandomLoadingMessage() {
    const loadingMessages = [
        "Plongez dans l'aventure avec notre générateur d'histoires IA : vous êtes le héros, et c'est vous qui décidez du scénario...",
        "Découvrez une nouvelle dimension de narration interactive avec notre IA : faites l'expérience d'histoires où chaque choix compte...",
        "Immergez-vous dans des mondes fantastiques façonnés par vous et notre IA : votre histoire, vos choix, votre aventure. Bienvenue dans l'avenir de la narration interactive..."
    ];
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    return loadingMessages[randomIndex];
}

function copyClipboard() {
    // a tester sur smartphone avant d'enlever
    navigator.clipboard.writeText(formattedMessage)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            // Cela pourrait échouer si l'utilisateur refuse de permettre l'accès au presse-papier
            console.error('Could not copy text: ', err);
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

        // anciens boutons radio
        // for (let i = 0; i < choicesEl.length; i++) {
        //     choicesEl[i].checked = false;
        // }

        // ré-initialiser la conversation
        fetch('/api/reset', {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => console.log(data.message))
            .catch(error => console.error('Une erreur est survenue :', error));



    } else {
        // Sinon, envoyer la question avec la valeur dans question
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