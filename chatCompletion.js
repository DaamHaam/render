
// // pour utiliser la syntaxe es module j'utilise l'extension mjs
// // es module
// import { config } from "dotenv"
// config()

// import { Configuration, OpenAIApi } from "openai"

// console.log(process.env.OPENAI_API_KEY)

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);


// // fonction à appeler d'ailleurs
// export async function getCompletion(content) {

//     // a remettre // pour les tests fonction simplifiée
//     // const completion = await openai.createChatCompletion({
//     //     model: "gpt-3.5-turbo",
//     //     messages: [{ role: "user", content: content }],
//     // });


//     // return completion.data.choices[0].message;
//     return ("voilà votre question : " + content + " // et la réponse ? ...")
// }


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

    // a remettre // pour les tests fonction simplifiée
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: content }],
    });

    return completion.data.choices[0].message.content;
    // return ("voilà votre question : " + content + " // et la réponse ? ...");
}

module.exports = { getCompletion };
