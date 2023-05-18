

// Utilisez ces variables comme vous le faisiez avant


// commonJS à nouveau
const { config } = require("dotenv");
config();

const { Configuration, OpenAIApi } = require("openai");

console.log(process.env.OPENAI_API_KEY);

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//*
// Initialize conversation history
let conversationHistory = [];


// fonction à appeler d'ailleurs
async function getCompletion(content) {
    let texteInitial = "Tu es un jeu vidéo textuel. Invente un scénario de trois lignes et propose moi 3 options pour la suite de l'histoire (A/, B/ et C/), sans me raconter la suite au premier message, laisse moi juste 4 choix. La scène se passe dans le monde de : ";
    let texteEtape = " est ma réponse, poursuis l'histoire en trois lignes puis propose moi 3 choix A) B) C) pour la suite"
    // Add texteCache only at the beginning of the conversation
    if (conversationHistory.length === 0) {
        content = texteInitial + content;
    }
    else {
        content = texteEtape + content;
    }


    //* 
    // Add the new user message to the conversation history
    conversationHistory.push({ role: "user", content: content });



    // a remettre // pour les tests fonction simplifiée
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: conversationHistory
    });

    // * Add the new bot message to the conversation history
    conversationHistory.push({ role: "assistant", content: completion.data.choices[0].message.content });


    return completion.data.choices[0].message.content;
    // return ("voilà votre question : " + content + " // et la réponse ? ...");
}

module.exports = { getCompletion };
