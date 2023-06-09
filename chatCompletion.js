

// probleme a resoudre getclientresponse attend donc quand réponse personnalisée erreur à ce niveau car pas réponse attendue
// mais non gênante car pas de réponse attendue, prévu.

// erreurs de choix histoire parfois / melange 0 1 2

// TODO :
// rajout choix libre aux étapes : prompt adapté + qui évalue suite ou perdu....
// donner exemple de json à chaque étape pr réduire erreurs de parsing
// indexQuestion dans script.js attention évolue en parallèle / complique projets multiples

// commonJS imposé par serveur nodejs
const { config } = require("dotenv");
config();
const configPrompt = require("./configPrompt.js");

const { Configuration, OpenAIApi } = require("openai");
const e = require("express");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Initialize conversation history
// let conversationHistory = [];
let sessions = {};

// Utilisez les configurations
let nombreDeChoix = configPrompt.nombreDeChoix;
let nombreDeQuestionsMax = configPrompt.nombreDeQuestionsMax;

let phraseAgeValue = "";


// modifyState = par défaut true = vraie réponse et pas génération anticipée
async function getCompletion(messageClient, ageValue, sessionID, modifyState = true) {
    console.log("messageClient : " + messageClient + "  modifyState : " + modifyState);
    // console.log("ageValue : " + ageValue);
    // console.log("sessionID : " + sessionID);

    // création d'une nouvelle session si besoin
    let sessionData = sessions[sessionID];
    if (!sessionData) {
        sessionData = createNewSession(sessionID, ageValue);
    }




    let isPersonalizedAnswer = false;
    let personalizedAnswer = '';

    if (messageClient.length === 1) {
        // C'est une lettre unique / pas personnalisation
    } else if (messageClient.startsWith('D - ')) {
        // C'est la lettre D suivie d'une réponse personnalisée
        isPersonalizedAnswer = true;
        personalizedAnswer = messageClient.substring(4); // Cela enlève 'D - ' du début
        console.log("personalizedAnswer : " + personalizedAnswer);

        messageClient = personalizedAnswer;

    } else {
        // Autre cas à traiter
        console.log("nom du héros, ou reponse perso ne commence pas par D - non prévu");
    }


    // Stocker le gameID actuel pour vérification ultérieure
    let currentGameID = sessionData.gameID;

    //  Emplacement aléatoire du note choix
    let letters = ['A', 'B', 'C'];
    let badChoiceIndex = letters[Math.floor(Math.random() * letters.length)];

    // verifie qu'un age est défini et phrase supplémentaire à ajouter
    if (!sessionData.ageLocal || sessionData.ageLocal === "0") {
        phraseAgeValue = "";
    }
    else {
        phraseAgeValue = "L'histoire et le vocabulaire doivent être vraiment ciblés pour cette tranche d'âge : " + sessionData.ageLocal + " ans.";
    }

    // adaptation des prompts
    let promptInitial = configPrompt.promptInitialTemplate
        .replace("{nombreDeChoix}", nombreDeChoix)
        .replace("{badChoiceIndex}", badChoiceIndex)
        .replace("{messageClient}", messageClient)
        .replace("{phraseAgeValue}", phraseAgeValue);

    // console.log("promptInitial : " + promptInitial);

    let texteEtape = configPrompt.texteEtapeTemplate
        .replace("{nombreDeChoix}", nombreDeChoix)
        .replace("{badChoiceIndex}", badChoiceIndex)
        .replace("{messageClient}", messageClient)
        .replace("{phraseAgeValue}", phraseAgeValue);




    let texteDeFinGagne = configPrompt.texteDeFinGagneTemplate
        .replace("{messageClient}", messageClient)
        .replace("{phraseAgeValue}", phraseAgeValue);


    let texteDeFinGagnePerso = configPrompt.texteDeFinGagnePerso
        .replace("{messageClient}", messageClient)
        .replace("{phraseAgeValue}", phraseAgeValue);

    if (isPersonalizedAnswer) {
        // console.log("texteGagne isP : " + texteDeFinGagne);
    }
    let texteDeFinPerdue = configPrompt.texteDeFinPerdueTemplate
        .replace("{messageClient}", messageClient)
        .replace("{phraseAgeValue}", phraseAgeValue);



    // étapes de la conversation, réponse du client sur les choix anticipés
    if (sessionData.indexQuestion >= 1 && modifyState && !isPersonalizedAnswer) {

        try {
            const clientChoice = await getClientResponse(sessionID, messageClient);

            console.log("Choix du client arrivé : " + clientChoice);

            let errorParse = false;
            // Parsing de la réponse de l'assistant
            let clientChoiceParsed;
            try {
                clientChoiceParsed = JSON.parse(clientChoice);
            } catch (err) {
                console.error("Erreur lors du parsage de la réponse de l'assistant, contenu " + clientChoice + ", erreur : ", err);
                errorParse = true;
                return;
            }

            // si pas fin de partie (gagné ou perdu)
            // stocker les choix précédents pour les réponses suivantes, générer suite,etc...
            if (sessionData.indexQuestion < nombreDeQuestionsMax && !(clientChoiceParsed.choixA === "0" && clientChoiceParsed.choixB === "0" && clientChoiceParsed.choixC === "0")) {


                // MAJ précédent choix pour réponses suivantes adaptées
                sessionData.choixPrecedents = {
                    noteChoixA: clientChoiceParsed.noteChoixA,
                    noteChoixB: clientChoiceParsed.noteChoixB,
                    noteChoixC: clientChoiceParsed.noteChoixC
                }

                // rajoute la réponse de l'assistant dans l'historique
                // sessionData.conversationHistory.push({ role: "user", content: texteEtape });
                // console.log("texteEtape : " + texteEtape);
                // rajoute la réponse de l'assistant dans l'historique
                sessionData.conversationHistory.push({ role: "assistant", content: clientChoice });



                sessionData.indexQuestion += 1;
                console.log("indexQuestion passe à : ", sessionData.indexQuestion);


                // lancer la génération des réponses suivantes hypothétiques
                // 
                generateNextResponses(sessionData, ageValue, sessionID);

            }

            // console.log("historique étape : " + JSON.stringify(sessionData.conversationHistory));

            return clientChoice;

        } catch (error) {
            console.error("Une erreur est survenue lors de la récupération du choix du client :", error);
        }


    }


    // si c'est la première question et anticipation de la réponse
    let contentForGPT;


    if (!isPersonalizedAnswer) {
        // si c'est la première question
        if (sessionData.conversationHistory.length === 0) {
            contentForGPT = promptInitial;
        } else {
            // si c'est une question suivante par anticipation
            if (sessionData.choixPrecedents[`noteChoix${messageClient}`] === 0) {
                contentForGPT = texteDeFinPerdue;
            } else {
                console.log(sessionData.indexQuestion + " questions vs max : " + nombreDeQuestionsMax)
                if (sessionData.indexQuestion == nombreDeQuestionsMax) {
                    contentForGPT = texteDeFinGagne;
                } else {
                    contentForGPT = texteEtape;
                }
            }
        }
    }
    // si réponse personnalisée
    else {
        contentForGPT = texteDeFinGagnePerso;
        console.log("contentForGPT quand réponse personnalisée : " + contentForGPT);
    }

    // console.log("contentForGPT : " + contentForGPT);


    // Copier l'historique de la conversation
    let tempConversationHistory = [...sessionData.conversationHistory];

    // Ajouter le nouveau message de l'utilisateur à l'historique temporaire
    tempConversationHistory.push({ role: "user", content: contentForGPT });

    // Si modifyState est vrai, mettre à jour l'historique réel de la session
    if (modifyState) {
        sessionData.conversationHistory = tempConversationHistory;
        // console.log("historique mis a jour avec isP : " + JSON.stringify(sessionData.conversationHistory));
    }


    // Appel de l'API avec l'historique temporaire
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: tempConversationHistory
    });

    // Vérifier si le gameID actuel correspond à celui de l'API
    if (currentGameID !== sessionData.gameID) {
        // Le jeu a été réinitialisé entre-temps, donc ignorer cette réponse
        return JSON.stringify({ "error": "gameID_mismatch", "message": "Le jeu a été réinitialisé entre-temps, donc cette réponse a été ignorée." });
    }



    let errorParse = false;
    // Parsing de la réponse de l'assistant
    let reponseAssistant;
    try {
        reponseAssistant = JSON.parse(completion.data.choices[0].message.content);
    } catch (err) {
        console.error("Erreur lors du parsage de la réponse de l'assistant:", err);
        errorParse = true;
        return;
    }
    // console.log("reponseAssistant ", reponseAssistant);
    // console.log("completion data : ", completion.data.choices[0].message.content);


    let currentResponse;

    // si le parsing est ok, stocker quels sont les bons ou mauvais choix
    if (errorParse == false) {

        // modifer index question choixprecedents et conversation history que si vraie réponse et pas hypothèse
        if (modifyState) {
            sessionData.choixPrecedents = {
                noteChoixA: reponseAssistant.noteChoixA,
                noteChoixB: reponseAssistant.noteChoixB,
                noteChoixC: reponseAssistant.noteChoixC
            };

            // incr 1 index question mais aussi plus haut pour etapes
            sessionData.indexQuestion += 1;
            console.log("indexQuestion passe à : ", sessionData.indexQuestion);


            // rajoute la réponse de l'assistant dans l'historique uniquement si c'est une vraie réponse
            sessionData.conversationHistory.push({ role: "assistant", content: completion.data.choices[0].message.content });
            console.log("historique mis a jour avec isP BIS : " + JSON.stringify(sessionData.conversationHistory));
        }

        // stocke la réponse première de l'assistant dans une variable
        currentResponse = completion.data.choices[0].message.content;
    }

    // si le parsing est en erreur
    else {
        return JSON.stringify({ "erreur": "JSON", "message": "Erreur parsing coté serveur" });
    }

    // Générer les réponses pour les choix suivants si c'est la première question : une demande user et une reponse assistant soit 2 éléments dans l'historique

    // console.log("Longueur de l'historique de conversation : ", sessionData.conversationHistory.length);
    // fonction pour générer les réponses suivantes, en fonction de l'age, de l'historique de conversation et de l'index de la question
    // seule la réponse utilisateur appelle cette fonction
    // en l'occurence la réponse utilisateur est le prompt initial sinon c'est retourné avant

    // si gagné, indexQuestion a atteint le nombre de questions max et on ne génère plus de réponses 
    if (modifyState && (sessionData.indexQuestion < nombreDeQuestionsMax + 1) && !isPersonalizedAnswer) {
        console.log("generating");
        generateNextResponses(sessionData, ageValue, sessionID);
    }

    return currentResponse;

}

function resetConversation(sessionID) {
    // Vérifiez d'abord si la session existe
    let sessionData = sessions[sessionID];
    if (sessionData) {
        sessionData.conversationHistory = [];
        sessionData.indexQuestion = 0;
        sessionData.choixPrecedents = {};
        sessionData.gameID = generateGameID(); // Générer un nouveau gameID lors de la réinitialisation
        console.log("conversation effacée");
    } else {
        console.log("Aucune session active avec l'ID donné");
    }
}

async function generateNextResponses(sessionData, ageValue, sessionID) {
    // sessionData.nextResponses = {};

    // console.log("indexQuestion dans generateNext : ", sessionData.indexQuestion);

    if (sessionData.indexQuestion < nombreDeQuestionsMax + 1) {

        const nextResponsesPromises = ['A', 'B', 'C'].map(choice => {
            const nextResponsePromise = getCompletion(choice, ageValue, sessionID, false);
            return nextResponsePromise;
        });

        // console.log("Longueur de l'historique de conversation une fois remis  après encore : ", sessionData.conversationHistory.length);

        const nextResponses = await Promise.all(nextResponsesPromises);


        sessionData.nextResponses = {
            'A': nextResponses[0],
            'B': nextResponses[1],
            'C': nextResponses[2]
        };

        console.log("sessionData.nextResponses : ", sessionData.nextResponses);
    }
}

async function getClientResponse(sessionID, clientChoice) {
    let sessionData = sessions[sessionID];

    console.log("getClientResponse : ", clientChoice);

    // Vérifier si les réponses anticipées sont prêtes
    if (!sessionData.nextResponses) {
        // Si les réponses anticipées ne sont pas prêtes, attendre
        await new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (sessionData.nextResponses) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    // À ce stade, les réponses anticipées devraient être prêtes
    let response = sessionData.nextResponses[clientChoice];

    let userResponse = ("Mon choix est " + clientChoice + ".")
    sessionData.conversationHistory.push({ role: "user", content: userResponse });

    // Supprimer les réponses anticipées pour le prochain tour
    delete sessionData.nextResponses;

    return response;
}

// Generate a unique game ID
function generateGameID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function createNewSession(sessionID, ageValue) {
    let sessionData = {
        conversationHistory: [],
        indexQuestion: 0,
        choixPrecedents: {},
        ageLocal: ageValue,
        gameID: generateGameID(),
    };
    sessions[sessionID] = sessionData;
    return sessionData;
}




module.exports = { getCompletion, resetConversation };