
//A FAIRE ID DE PARTIE POUR TRAITER ANCIENNNES REponses en cas de reset
// pas d'appel api si fin de partie gagne ou perdu (extraire choixprecedents et adapter)


// commonJS à nouveau
const { config } = require("dotenv");
config();
const configPrompt = require("./configPrompt.js");

const { Configuration, OpenAIApi } = require("openai");

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

// modifyState = par défaut true = vraie réponse et pas hypothèse
async function getCompletion(messageClient, ageValue, sessionID, modifyState = true) {
    console.log("messageClient : " + messageClient);
    console.log("ageValue : " + ageValue);
    console.log("sessionID : " + sessionID);

    let sessionData = sessions[sessionID];

    if (!sessionData) {
        sessionData = {
            conversationHistory: [],
            indexQuestion: 0,
            choixPrecedents: {},
            ageLocal: ageValue,
            // pour cette session, c'est la partie 0
            gameID: 0
            // ajouter ici d'autres variables de session si nécessaire
        };
        sessions[sessionID] = sessionData;
    }

    // aleatoire mauvais choix
    let letters = ['A', 'B', 'C'];
    let badChoiceIndex = letters[Math.floor(Math.random() * letters.length)];

    // verifie qu'un age est défini
    if (!sessionData.ageLocal || sessionData.ageLocal === "0") {
        phraseAgeValue = "";
    }
    else {
        phraseAgeValue = "L'histoire et le vocabulaire doivent être vraiment ciblés pour cette tranche d'âge : " + sessionData.ageLocal + " ans.";
    }


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


    let texteDeFinPerdue = configPrompt.texteDeFinPerdueTemplate
        .replace("{messageClient}", messageClient)
        .replace("{phraseAgeValue}", phraseAgeValue);


    // étapes de la conversation
    if (sessionData.indexQuestion >= 1 && modifyState) {
        try {
            const clientChoice = await getClientResponse(sessionID, messageClient, sessionData.gameID);
            console.log("Choix du client arrivé !!! :" + clientChoice);

            // rajoute la réponse de l'assistant dans l'historique
            sessionData.conversationHistory.push({ role: "user", content: texteEtape });

            // rajoute la réponse de l'assistant dans l'historique
            sessionData.conversationHistory.push({ role: "assistant", content: clientChoice });


            sessionData.indexQuestion += 1;
            console.log("indexQuestion passe à : ", sessionData.indexQuestion);

            generateNextResponses(sessionData, ageValue, sessionID);

            return clientChoice;

        } catch (error) {
            console.error("Une erreur est survenue lors de la récupération du choix du client :", error);
        }
    }


    let contentForGPT;

    // si c'est la première question
    if (sessionData.conversationHistory.length === 0) {
        contentForGPT = promptInitial;
    } else {
        // si c'est une question suivante
        if (sessionData.choixPrecedents[`mauvaisChoix${messageClient}`]) {
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
    // console.log("contentForGPT : " + contentForGPT);



    // Copier l'historique de la conversation
    let tempConversationHistory = [...sessionData.conversationHistory];

    // Ajouter le nouveau message de l'utilisateur à l'historique temporaire
    tempConversationHistory.push({ role: "user", content: contentForGPT });

    // Si modifyState est vrai, mettre à jour l'historique réel de la session
    if (modifyState) {
        sessionData.conversationHistory = tempConversationHistory;
    }



    // Appel de l'API avec l'historique temporaire
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: tempConversationHistory
    });



    // console.log("Réponse complète de l'API : ", completion.data);
    // console.log("tentative parsing serveur de : " + completion.data.choices[0].message.content);


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
                mauvaisChoixA: reponseAssistant.mauvaisChoixA,
                mauvaisChoixB: reponseAssistant.mauvaisChoixB,
                mauvaisChoixC: reponseAssistant.mauvaisChoixC
            };

            // incr 1 index question mais aussi plus haut pour etapes
            sessionData.indexQuestion += 1;
            console.log("indexQuestion passe à : ", sessionData.indexQuestion);


            // rajoute la réponse de l'assistant dans l'historique
            sessionData.conversationHistory.push({ role: "assistant", content: completion.data.choices[0].message.content });

        }

        // stocke la réponse première de l'assistant dans une variable
        currentResponse = completion.data.choices[0].message.content;
    }

    // si le parsing est en erreur
    else {
        return JSON.stringify({ "erreur": "JSON" });
    }

    // Générer les réponses pour les choix suivants si c'est la première question : une demande user et une reponse assistant soit 2 éléments dans l'historique
    console.log("Longueur de l'historique de conversation : ", sessionData.conversationHistory.length);

    // fonction pour générer les réponses suivantes, en fonction de l'age, de l'historique de conversation et de l'index de la question

    // seule la réponse utilisateur appelle cette fonction
    if (modifyState) {
        generateNextResponses(sessionData, ageValue, sessionID, sessionData.gameID);
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
        // Increment gameID each time the conversation is reset
        sessionData.gameID++;
        console.log("gameED : ", sessionData.gameID);
        console.log("conversation effacée");
    } else {
        console.log("Aucune session active avec l'ID donné");
    }
}

async function generateNextResponses(sessionData, ageValue, sessionID, gameID) {
    // sessionData.nextResponses = {};

    console.log("indexQuestion dans generateNext : ", sessionData.indexQuestion);

    if (sessionData.indexQuestion < nombreDeQuestionsMax + 1) {

        const nextResponsesPromises = ['A', 'B', 'C'].map(choice => {
            const nextResponsePromise = getCompletion(choice, ageValue, sessionID, false);
            return nextResponsePromise;
        });

        console.log("Longueur de l'historique de conversation une fois remis  après encore : ", sessionData.conversationHistory.length);

        const nextResponses = await Promise.all(nextResponsesPromises);

        // Only update nextResponses if gameID hasn't changed
        if (sessionData.gameID === gameID) {
            sessionData.nextResponses = {
                'A': nextResponses[0],
                'B': nextResponses[1],
                'C': nextResponses[2]
            };
        }
        console.log("sessionData.nextResponses : ", sessionData.nextResponses);
    }
}

async function getClientResponse(sessionID, clientChoice) {
    let sessionData = sessions[sessionID];

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

    // Supprimer les réponses anticipées pour le prochain tour
    delete sessionData.nextResponses;

    return response;
}


module.exports = { getCompletion, resetConversation };