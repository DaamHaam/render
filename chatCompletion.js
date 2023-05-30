
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

// let indexQuestion = 0;
// let choixPrecedents = {};


async function getCompletion(messageClient, ageValue, sessionID) {
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


    let contentForGPT;

    // si c'est la première question
    if (sessionData.conversationHistory.length === 0) {
        contentForGPT = promptInitial;
    } else {
        // si c'est une question suivante
        if (sessionData.choixPrecedents[`mauvaisChoix${messageClient}`]) {
            contentForGPT = texteDeFinPerdue;
        } else {
            if (sessionData.indexQuestion == nombreDeQuestionsMax) {
                contentForGPT = texteDeFinGagne;
            } else {
                contentForGPT = texteEtape;
            }
        }
    }
    console.log("contentForGPT : " + contentForGPT);

    sessionData.conversationHistory.push({ role: "user", content: contentForGPT });

    let errorParse = false;


    // Appel de l'API
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: sessionData.conversationHistory
    });


    console.log("Réponse complète de l'API : ", completion.data);
    console.log("tentative parsing serveur de : " + completion.data.choices[0].message.content);

    // Parsing de la réponse de l'assistant
    let reponseAssistant;
    try {
        reponseAssistant = JSON.parse(completion.data.choices[0].message.content);
    } catch (err) {
        console.error("Erreur lors du parsage de la réponse de l'assistant:", err);
        errorParse = true;
        return;
    }
    console.log("reponseAssistant ", reponseAssistant);
    console.log("completion data : ", completion.data.choices[0].message.content);



    // si le parsing est ok, stocker quels sont les bons ou mauvais choix
    if (errorParse == false) {
        sessionData.choixPrecedents = {
            mauvaisChoixA: reponseAssistant.mauvaisChoixA,
            mauvaisChoixB: reponseAssistant.mauvaisChoixB,
            mauvaisChoixC: reponseAssistant.mauvaisChoixC
        };

        sessionData.indexQuestion += 1;

        // rajoute la réponse de l'assistant dans l'historique
        sessionData.conversationHistory.push({ role: "assistant", content: completion.data.choices[0].message.content });
        return completion.data.choices[0].message.content;
    }

    // si le parsing est en erreur
    else {
        return JSON.stringify({ "erreur": "JSON" });
    }
}



function resetConversation(sessionID) {
    // Vérifiez d'abord si la session existe
    let sessionData = sessions[sessionID];
    if (sessionData) {
        sessionData.conversationHistory = [];
        sessionData.indexQuestion = 0;
        sessionData.choixPrecedents = {};
        console.log("conversation effacée");
    } else {
        console.log("Aucune session active avec l'ID donné");
    }
}


module.exports = { getCompletion, resetConversation };