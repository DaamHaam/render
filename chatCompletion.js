
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
let conversationHistory = [];
let sessions = {};

// Utilisez les configurations
let nombreDeChoix = configPrompt.nombreDeChoix;
let nombreDeQuestionsMax = configPrompt.nombreDeQuestionsMax;

let indexQuestion = 0;
let choixPrecedents = {};


async function getCompletion(messageClient, sessionID) {
    let sessionData = sessions[sessionID];
    if (!sessionData) {
        sessionData = {
            conversationHistory: [],
            indexQuestion: 0,
            choixPrecedents: {},
            // ajouter ici d'autres variables de session si nécessaire
        };
        sessions[sessionID] = sessionData;
    }

    // aleatoire mauvais choix
    let letters = ['A', 'B', 'C'];
    let badChoiceIndex = letters[Math.floor(Math.random() * letters.length)];

    let promptInitial = configPrompt.promptInitialTemplate
        .replace("{nombreDeChoix}", config.nombreDeChoix)
        .replace("{badChoiceIndex}", badChoiceIndex)
        .replace("{messageClient}", messageClient);

    let texteEtape = configPrompt.texteEtapeTemplate
        .replace("{nombreDeChoix}", config.nombreDeChoix)
        .replace("{badChoiceIndex}", badChoiceIndex)
        .replace("{messageClient}", messageClient);

    let texteDeFinGagne = configPrompt.texteDeFinGagneTemplate
        .replace("{messageClient}", messageClient);

    let texteDeFinPerdue = configPrompt.texteDeFinPerdueTemplate
        .replace("{messageClient}", messageClient);

    let contentForGPT;
    let messageFinal;

    if (sessionData.conversationHistory.length === 0) {
        contentForGPT = promptInitial;
    } else {
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

    sessionData.conversationHistory.push({ role: "user", content: contentForGPT });

    let errorParse = false;

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: sessionData.conversationHistory
    });

    console.log("Réponse complète de l'API : ", completion.data);
    console.log("tentative parsing serveur de : " + completion.data.choices[0].message.content);

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

    if (errorParse == false) {
        sessionData.choixPrecedents = {
            mauvaisChoixA: reponseAssistant.mauvaisChoixA,
            mauvaisChoixB: reponseAssistant.mauvaisChoixB,
            mauvaisChoixC: reponseAssistant.mauvaisChoixC
        };

        sessionData.indexQuestion += 1;

        sessionData.conversationHistory.push({ role: "assistant", content: completion.data.choices[0].message.content });
        return completion.data.choices[0].message.content;
    }
    else {
        return JSON.stringify({ "erreur": "JSON" });
    }
}



// // fonction appelée par le côté client
// async function getCompletion(messageClient, sessionID) {

//     // aleatoire mauvais choix
//     let letters = ['A', 'B', 'C'];
//     let badChoiceIndex = letters[Math.floor(Math.random() * letters.length)];

//     let promptInitial = configPrompt.promptInitialTemplate
//         .replace("{nombreDeChoix}", config.nombreDeChoix)
//         .replace("{badChoiceIndex}", badChoiceIndex)
//         .replace("{messageClient}", messageClient);

//     let texteEtape = configPrompt.texteEtapeTemplate
//         .replace("{nombreDeChoix}", config.nombreDeChoix)
//         .replace("{badChoiceIndex}", badChoiceIndex)
//         .replace("{messageClient}", messageClient);

//     let texteDeFinGagne = configPrompt.texteDeFinGagneTemplate
//         .replace("{messageClient}", messageClient);

//     let texteDeFinPerdue = configPrompt.texteDeFinPerdueTemplate
//         .replace("{messageClient}", messageClient);

//     let contentForGPT;
//     let messageFinal;

//     // only at the beginning of the conversation
//     if (conversationHistory.length === 0) {
//         contentForGPT = promptInitial;
//     }
//     // si ce n'est pas l'étape 1
//     else {
//         // Vérifier si le choix précédent est mauvais
//         if (choixPrecedents[`mauvaisChoix${messageClient}`]) {
//             // Si le choix est mauvais
//             contentForGPT = texteDeFinPerdue;
//         } else {
//             // si le choix est bon :
//             // si c'est la fin = gagné
//             if (indexQuestion == nombreDeQuestionsMax) {
//                 contentForGPT = texteDeFinGagne;
//             }
//             else {
//                 // Si le choix est correct, vous pouvez procéder à l'étape suivante
//                 contentForGPT = texteEtape;
//             }
//         }
//     }

//     // Add the new user message to the conversation history
//     conversationHistory.push({ role: "user", content: contentForGPT });

//     let errorParse = false;

//     // envoi de toute la conversation plus la nouvelle demande
//     const completion = await openai.createChatCompletion({
//         model: "gpt-3.5-turbo",
//         messages: conversationHistory
//         // max_tokens: 4096,
//     });

//     console.log("Réponse complète de l'API : ", completion.data);
//     console.log("tentative parsing serveur de : " + completion.data.choices[0].message.content);

//     // Parsez la réponse de l'assistant
//     let reponseAssistant;
//     try {
//         reponseAssistant = JSON.parse(completion.data.choices[0].message.content);
//     } catch (err) {
//         console.error("Erreur lors du parsage de la réponse de l'assistant:", err);
//         errorParse = true;
//         return; // ou gérer l'erreur 
//     }

//     console.log("reponseAssistant ", reponseAssistant);
//     console.log("completion data : ", completion.data.choices[0].message.content);

//     // Stocker les informations de choix
//     if (errorParse == false) {
//         choixPrecedents = {
//             mauvaisChoixA: reponseAssistant.mauvaisChoixA,
//             mauvaisChoixB: reponseAssistant.mauvaisChoixB,
//             mauvaisChoixC: reponseAssistant.mauvaisChoixC
//         };

//         // incremente indice de question
//         indexQuestion += 1;

//         // Add the new bot message to the conversation history
//         conversationHistory.push({ role: "assistant", content: completion.data.choices[0].message.content });
//         return completion.data.choices[0].message.content;
//     }
//     else {
//         return JSON.stringify({ "erreur": "JSON" });
//     }
// }


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