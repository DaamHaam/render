

// commonJS à nouveau
const { config } = require("dotenv");
config();

const { Configuration, OpenAIApi } = require("openai");

console.log(process.env.OPENAI_API_KEY);

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// fonction à appeler d'ailleurs
async function getCompletion(content) {
    let texteCache = "Tu es un jeu vidéo textuel. Invente un scénario de trois lignes et propose moi 4 options pour la suite de l'histoire (A/, B/, C/ et D/), sans me raconter la suite, laisse moi juste 4 choix. La scène se passe dans le monde de : ";
    content = texteCache + content;
    // a remettre // pour les tests fonction simplifiée
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: content }],
    });

    return completion.data.choices[0].message.content;
    // return ("voilà votre question : " + content + " // et la réponse ? ...");
}

module.exports = { getCompletion };
