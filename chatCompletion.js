

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
    let texteInitial = "Tu es un jeu vidéo textuel. Ecris une histoire de dix à douze lignes puis propose moi 3 choix d'actions pour le héros (A/, B/ et C/), sans me raconter la suite au premier message, laisse moi juste 3 choix. Dans ta réponse met chaque choix entre double crochets par exemple [[A/ agir comme cela...]]. L'histoire se déroule dans l'univers du héros, et ce héros est : ";
    let texteEtape = " est ma réponse. Continue l'histoire en quatre à six lignes, puis propose moi 3 choix d'actions A) B) C) pour la suite."
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

function resetConversation() {
    console.log("Historique de conversation : " + conversationHistory);
    conversationHistory = [];
    console.log("conversation effacée");
}


module.exports = { getCompletion, resetConversation };
