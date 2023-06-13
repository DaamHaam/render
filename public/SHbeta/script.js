// obtention des éléments du DOM
const questionEl = document.getElementById('question');
const submitEl = document.getElementById('submit');
const responseEl = document.getElementById('response');

let resetMode = false; // état du bouton
let ageGroupHTML = `
<div class="ageGroup">

    <p>Quel âge avez-vous ? (facultatif 🙂) </p> <!-- Titre -->

    <br> <!-- Saut de ligne -->

    <input type="radio" id="age1" name="age" value="4 à 7" class="radioAge">
    <label for="age1" class="radioLabel">4 à 7 ans</label>

    <br><br> <!-- Sauts de ligne supplémentaires -->

    <input type="radio" id="age2" name="age" value="8 à 12" class="radioAge">
    <label for="age2" class="radioLabel">8 à 12 ans</label>

    <br><br> <!-- Sauts de ligne supplémentaires -->

    <input type="radio" id="age3" name="age" value="13 à 16" class="radioAge">
    <label for="age3" class="radioLabel">13 à 16 ans</label>

    <br><br> <!-- Sauts de ligne supplémentaires -->

    <input type="radio" id="age4" name="age" value="contenu adulte, plus de 16" class="radioAge">
    <label for="age4" class="radioLabel">+ de 16 ans</label>
</div>
`;

const waitMessage = "Pour l'instant, il faut attendre un peu 😊 " + "<br>";
const appName = "";

let indexQuestion = 0;

interfaceInitiale();

let sessionID = generateSessionId();

// fonction pour envoyer une demande à l'API via chatCompletion
async function sendRequest(content, ageValue) {
    console.log("question envoyée");

    activateResetMode();

    startProgressBar();

    // si première question
    if (indexQuestion === 0) {
        responseEl.innerHTML = 'Génération en cours 🤞...' + '<br><br>' + '<b>' + appName + '</b>'
            // + '<br><br>'
            // + getRandomLoadingMessage() 
            // + '<br><br><br>' 
            + waitMessage + getRandomImage()
    }
    indexQuestion += 1;


    const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, ageValue, sessionID })
    });
    const data = await response.json();


    console.log("Tentative de parsing de JSON sur script.js : ", data.message);

    // Copiez le texte dans le presse-papier
    // copyClipboard();

    const jsonData = JSON.parse(data.message);


    // si erreur l'afficher dans la console 
    if (jsonData.error) {
        // Une erreur s'est produite, donc ignorer cette réponse
        console.error("ERREUR" + data.message); // Afficher le message d'erreur dans la console
        return;
    }
    else {


        stopProgressBar();
        // console.log(data.message);


        let formattedMessage = "";
        let persoButton = false;

        if (jsonData.erreur) {
            formattedMessage += "ERREUR serveur - cliquer Recommencer";
        }
        else {
            // verifie que les cles sont presentes avant
            if (jsonData.histoire) {
                formattedMessage += jsonData.histoire;
            }

            // effectuer cela que si tous les jsonData.choix A B et C ne sont pas toutes égal à 2 = pas en cas de victoire 
            // et pas en cas de défaite
            // et si les valeurs sont présentes
            if (jsonData.choixA && jsonData.choixB && jsonData.choixC) {
                if (!(jsonData.choixA == "2" && jsonData.choixB == "2" && jsonData.choixC == "2")
                    && !(jsonData.choixA == "0" && jsonData.choixB == "0" && jsonData.choixC == "0")
                ) {
                    formattedMessage += "<br><br><div id='choixA' class='choiceN'><b>" + jsonData.choixA + "</b></div>";
                    formattedMessage += "<br><div id='choixB' class='choiceN'><b>" + jsonData.choixB + "</b></div>";
                    formattedMessage += "<br><div id='choixC' class='choiceN'><b>" + jsonData.choixC + "<b></div><br>";
                    // si la question est la xx, ajouter un bouton pour la réponse personnalisée
                    if (indexQuestion < 4) {
                        persoButton = true;
                        formattedMessage += "<div id='customChoice' class='choiceP customChoiceStyle'><input type='text' id='customResponse' class='customResponseStyle'/><button id='customSubmit' class='choiceN customSubmitStyle'><i class='fas fa-paper-plane'></i></button></div><br>";

                    }
                }
            }
        }
        formattedMessage += "<br>";

        // rajoute une image
        formattedMessage += getSpecificOrRandomImage(jsonData.choixA, jsonData.choixB, jsonData.choixC);

        // Utilisez innerHTML au lieu de textContent pour permettre le rendu du HTML
        responseEl.innerHTML = formattedMessage;
        responseEl.scrollTop = 0;

        if (persoButton) {
            // Ajouter l'écouteur d'événement ici, après que le bouton soit créé
            document.getElementById('customSubmit').addEventListener('click', () => {
                const customResponse = document.getElementById('customResponse').value;
                sendRequest("D - " + customResponse);

                // Supprime la classe "selected" de tous les choix
                for (let j = 0; j < choices.length; j++) {
                    choices[j].classList.remove('selected');
                }

                // Désactive tous les choix
                for (let j = 0; j < choices.length; j++) {
                    choices[j].style.pointerEvents = 'none';
                }
            });
        }
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
    }
}

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

// bouton valider / recommencer
submitEl.addEventListener('click', async () => {

    if (resetMode) {
        desactivateResetMode();
        stopProgressBar();

        // remettre questions âge
        interfaceInitiale();
        // ré-initialiser la conversation
        fetch('/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionID })  // inclure l'ID de session dans le corps de la requête
        })
            .then(response => response.json())
            .then(data => console.log(data.message))
            .catch(error => console.error('Une erreur est survenue :', error));

    } else {
        // Sinon, envoyer la question avec la valeur dans question
        const content = questionEl.value;

        // Obtenir la valeur du bouton radio sélectionné
        const ageRadios = document.getElementsByClassName('radioAge');
        let ageValue = "";
        for (let i = 0; i < ageRadios.length; i++) {
            if (ageRadios[i].checked) {
                ageValue = ageRadios[i].value;
                break;
            }
        }
        console.log(ageValue);

        sendRequest(content, ageValue);
    }
});



function activateResetMode() {
    // mettre le bouton en mode RESET = quand on joue
    resetMode = true;
    questionEl.disabled = true;
    submitEl.style.backgroundColor = "#F2880C" // change la couleur de fond en rouge
    submitEl.style.color = "white"; // change la couleur du texte en blanc
    submitEl.textContent = 'Recommencer';
}

function desactivateResetMode() {
    // Si le bouton est en mode "RESET", réinitialiser l'interface = quand on recommence
    resetMode = false;
    questionEl.disabled = false;
    submitEl.textContent = 'Générer';
    submitEl.style.backgroundColor = ""; // réinitialise la couleur de fond
    submitEl.style.color = ""; // réinitialise la couleur du texte
    responseEl.textContent = '';
    questionEl.value = '';
    indexQuestion = 0;
}

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

function startProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.visibility = 'visible';
    progressBar.style.transition = 'width 20s ease-in-out'; /* Remplit la barre en 15 secondes */
    progressBar.style.width = '100%';
}

function stopProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.transition = ''; /* Supprime l'animation */
    progressBar.style.width = '0%';
    progressBar.style.visibility = 'hidden';
}


function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


function getRandomImage() {
    const images = [

        'https://cdn.discordapp.com/attachments/996306699017273345/1116093709721809027/Damien_imagination_story_speed_books_colorful_white_background_e2476ae7-069b-43db-8c52-802b14ba6451.png',
        'https://cdn.discordapp.com/attachments/996306699017273345/1116095304400379954/Damien_imagination_story_speed_hero_colorful_white_background_8e8f5f6e-5848-40dc-9994-35028ae20575.png',
        'https://cdn.discordapp.com/attachments/996306699017273345/1116095289456082964/Damien_imagination_story_speed_hero_colorful_white_background_2214cda4-58b1-4496-b56f-29096198943e.png',
        'https://cdn.discordapp.com/attachments/996306699017273345/1116095276768317530/Damien_imagination_story_speed_hero_colorful_white_background_ee02c7ea-2d0f-4af7-af0f-f8ebb7268e86.png',
        'https://cdn.discordapp.com/attachments/996306699017273345/1116093726880714752/Damien_imagination_story_speed_books_colorful_white_background_defcce7c-4837-456b-a6d6-bca791915728.png'

    ];

    const randomIndex = Math.floor(Math.random() * images.length);
    const selectedImage = images[randomIndex];

    return `<img src="${selectedImage}" alt="Image représentant une histoire colorée" style="width: 100%;">`;
}

function getSpecificOrRandomImage(choixA, choixB, choixC) {
    // quand gagné, renvoyer une image spécifique
    // ne marche pas, à revoir, changer le json
    // if (choixA === "1" && choixB === "1" && choixC === "1") {
    //     // si toutes les valeurs sont égales à 1, renvoyez votre image spécifique
    //     return `<img src="assets/Massage.jpg" alt="Image spécifique" style="width: 100%;">`;
    // } else {
    // sinon, renvoyez une image aléatoire comme auparavant
    return getRandomImage();
    // }
}

function interfaceInitiale() {
    responseEl.innerHTML = ageGroupHTML + getRandomImage();
}



// stock images : 
// 'https://cdn.discordapp.com/attachments/996306699017273345/1112700163601997955/Damien_imagination_colorful_story_white_background_9c5be37e-3498-4291-844f-5b4762b65088.png',
// 'https://cdn.discordapp.com/attachments/996306699017273345/1112700168412872735/Damien_imagination_colorful_story_white_background_6bb208c3-56c1-4247-ac4d-e1460a733e6b.png',
// 'https://cdn.discordapp.com/attachments/996306699017273345/1112700195319324682/Damien_imagination_colorful_story_white_background_4fc168cb-dafa-4493-8aec-0d824db0fcc3.png',
// 'https://cdn.discordapp.com/attachments/996306699017273345/1112700199387803758/Damien_imagination_colorful_story_white_background_aa55c5af-3fdc-493b-a554-b9a99bba314e.png',