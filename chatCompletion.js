// pour essai d'un fichier de config des valeurs // pas de variables imbriquées dedans, valeurs "simples"
// const { nombreDeQuestionsMax, nombreDeChoix, promptInitial, texteEtape, texteDeFin } = require('./configHistoireChoix');

// commonJS à nouveau
const { config } = require("dotenv");
config();
const configPrompt = require("./configPrompt.js");

const { Configuration, OpenAIApi } = require("openai");

// console.log(process.env.OPENAI_API_KEY);

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//*
// Initialize conversation history
let conversationHistory = [];

// Utilisez les configurations
let nombreDeChoix = configPrompt.nombreDeChoix;
let nombreDeQuestionsMax = configPrompt.nombreDeQuestionsMax;


let indexQuestion = 0;

let choixPrecedents = {};


// fonction appelée par le côté client
async function getCompletion(messageClient) {

    // de côté
    // l'un sera vraiment adapté au héros, au contexte et au scénario, et aura une probabilité de défaite de 0. Un autre choix sera moyennement adapté et aura une probabilité de défaite de 0.5. Enfin un autre choix sera totalement inadapté, déplacé et ridicule, avec probabilité de défaite de 1. Place le plus mauvais choix au hasard entre les positions A et B.


    // cas particuliers : 
    // Quelques cas particuliers, car certains noms de héros doivent adapter l'hitoire : si jamais le héros demandé entre les triple guillemets ''' s'appelle Eliott, il sera mégalomane. S'il s'appelle Timéo, il sera distrait et oubliera tout. S'il s'appelle Noélie ou Patricia ou Mamoune, elle sera douée en dessin. S'il s'appelle Amélie, il jouera au hockey malgré ses douleurs au mollet. S'il s'appelle Lilouan, il aimera donner à manger aux poules et regarder Beyblade sur Netflix. S'il s'appelle Juliette, elle jouera au tennis et regarde la série HPI. S'il s'appelle Damien, il fera cuire des bulots et préparera la mayonnaise. S'il s'appelle Coralie, elle préparera des Spritz comme personne, ou des cocktails Moscow Mue. S'il s'appelle Maxence, il a plein de mangas. S'il s'appelle Mathéo, il va à la crèche et sait très bien expliquer le fonctionnement d'une crèche. Si ce ne sont pas ces prénoms, écrire l'histoire en rapport avec le héros proposé. 

    // remettre
    // aleatoire mauvais choix
    let letters = ['A', 'B', 'C'];
    let badChoiceIndex = letters[Math.floor(Math.random() * letters.length)];


    // Remplacer {0}, {1} et {2} dans la chaîne par nombreDeChoix, badChoiceIndex et messageClient respectivement
    // let promptInitial = configPrompt.promptInitialTemplate.replace("{nombreDeChoix}", nombreDeChoix).replace("{badChoiceIndex}", badChoiceIndex).replace("{messageClient}", messageClient);

    let promptInitial = configPrompt.promptInitialTemplate
        .replace("{nombreDeChoix}", config.nombreDeChoix)
        .replace("{badChoiceIndex}", badChoiceIndex)
        .replace("{messageClient}", messageClient);


    // en cours, mais ne prend jamais la voie de la défaite, ne retrouve pas seul l'option choisie avant
    let texteEtape = "Ta tâche est maintenant d'écrire la suite de l'histoire et de répondre uniquement en format JSON. Etape par étape : mon choix pour la suite est noté plus bas entre triple guillements '''. Il faut écrire la suite de l'histoire correspondante au choix, en six à huit lignes, puis il faut proposer " + nombreDeChoix + " choix d'actions différents pour le héros, qui seront classés A, B et C. N'écris pas la lettre devant chaque choix. L'un des choix doit être totalement inadapté, déplacé et ridicule. Il devra être placé en position " + badChoiceIndex + ". Ecris la réponse uniquement en structure JSON, répartie dans des paires clés-valeur, avec les clés suivantes : histoire, choixA, choixB, choixC, mauvaisChoixA, mauvaisChoixB, mauvaisChoixC. Les valeurs de 'mauvaisChoix' seront des bool true ou false, avec true s'il s'agit du choix inadapté. La partie histoire du JSON ne doit pas contenir les choix. La réponse doit contenir uniquement une structure JSON valide : attention à ne pas mettre de virgule après la dernière paire clé-valeur. Vérifie la validité du JSON avant de répondre. Mon choix est : ''' " + messageClient + " '''. "


    let texteDeFinGagne = "Ta tâche est maintenant d'écrire la fin de l'histoire et de répondre uniquement en format JSON.Etape par étape : mon choix pour la suite est noté plus bas entre triple guillements '''. Ta tâche est à nouveau de répondre uniquemet en format JSON valide : c'est la fin de l'histoire, il faut la conclure l'histoire, une belle happy-end qui exprime explicitement que le joueur a gagné, sans proposer de nouveaux choix, et l'histoire se termine par la phrase 'Vous avez gagné'. La fin de l'histoire doit être mise dans la clé histoire dans la structure JSON, et les autres clés auront pour valeur '0'. La réponse doit contenir uniquement une structure JSON valide. Vérifie la validité du JSON avant de répondre. Bien mettre les chaines de caractères entre guillemets. Attention ne pas mettre de virgule après la dernière paire clé-valeur... Mon choix pour la suite est : ''' " + messageClient + " '''. "

    let texteDeFinPerdue = "Ta tâche est maintenant d'écrire la fin de l'histoire et de répondre uniquement en format JSON. Etape par étape : mon choix est noté plus bas entre triple guillements '''. Ta tâche est de raconter la fin de l'histoire, et il faut montrer au joueur comment son dernier choix a entraîné la défaite. La fin doit être dramatique, surprenante, lyrique voire funeste, sans proposer de nouveaux choix, et l'histoire se termine par la phrase 'Vous avez perdu.' La fin de l'histoire doit être contenue dans la clé histoire dans la structure JSON, et les autres clés auront pour valeur '0'. La réponse doit contenir uniquement une structure JSON valide. Vérifie la validité du JSON avant de répondre. Bien mettre les chaines de caractères entre guillemets. Attention ne pas mettre de virgule après la dernière paire clé-valeur. Mon choix pour la suite est : ''' " + messageClient + " '''. ";


    let contentForGPT;
    let messageFinal;
    // Add texteCache only at the beginning of the conversation
    if (conversationHistory.length === 0) {
        contentForGPT = promptInitial;
    }
    // si ce n'est pas l'étape 1
    else {
        // Vérifier si le choix précédent est mauvais
        if (choixPrecedents[`mauvaisChoix${messageClient}`]) {
            // Si le choix est mauvais
            contentForGPT = texteDeFinPerdue;
            // messageFinal = "Vous avez perdu.";
        } else {
            // si le choix est bon :
            // si c'est la fin = gagné
            if (indexQuestion == nombreDeQuestionsMax) {
                contentForGPT = texteDeFinGagne;
                // messageFinal = "Vous avez gagné.";
            }
            else {
                // Si le choix est correct, vous pouvez procéder à l'étape suivante
                contentForGPT = texteEtape;
            }

        }



        // // si c'est la fin = gagné
        // if (indexQuestion == nombreDeQuestionsMax) {
        //     contentForGPT = texteDeFin;
        //     messageFinal = "Vous avez gagné.";
        // }
        // // étapes intermédiaires
        // else {
        //     // Vérifier si le choix précédent est mauvais
        //     if (choixPrecedents[`mauvaisChoix${messageClient}`]) {
        //         // Si le choix est mauvais, vous pouvez informer l'utilisateur et lui demander de réessayer
        //         contentForGPT = texteDeFinPerdue;
        //         messageFinal = "Vous avez perdu.";
        //     } else {
        //         // Si le choix est correct, vous pouvez procéder à l'étape suivante
        //         contentForGPT = texteEtape;
        //     }
        // }
    }

    //* 
    // Add the new user message to the conversation history
    conversationHistory.push({ role: "user", content: contentForGPT });

    // console.log("conversationHistory :", conversationHistory);





    let errorParse = false;

    // envoi de toute la conversation plus la nouvelle demande
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: conversationHistory
        // max_tokens: 4096,
    });

    console.log("Réponse complète de l'API : " + completion.data);

    console.log("tentative parsing serveur de : " + completion.data.choices[0].message.content);

    // Parsez la réponse de l'assistant
    let reponseAssistant;
    try {
        reponseAssistant = JSON.parse(completion.data.choices[0].message.content);
    } catch (err) {
        console.error("Erreur lors du parsage de la réponse de l'assistant:", err);
        errorParse = true;
        return; // ou gérer l'erreur comme vous le souhaitez
    }


    // 2 essais en cas de format json non valide
    // let reponseAssistant;
    // let parseError = false;
    // let attempts = 0;

    // do {
    //     attempts++;

    //     const completion = await openai.createChatCompletion({
    //         model: "gpt-3.5-turbo",
    //         messages: conversationHistory
    //         // max_tokens: 4096,
    //     });

    //     console.log("Réponse complète de l'API : " + completion.data);

    //     console.log("tentative parsing serveur de : " + completion.data.choices[0].message.content);

    //     try {
    //         reponseAssistant = JSON.parse(completion.data.choices[0].message.content);
    //     } catch (err) {
    //         console.error("Erreur lors du parsage de la réponse de l'assistant:", err);
    //         console.error("A l'essai numéro : ", attempts);

    //         parseError = true;

    //         // si c'est la deuxième tentative, créez un format JSON avec erreur
    //         if (attempts >= 2) {
    //             reponseAssistant = { "erreur": "JSON" };
    //             parseError = false; // pour sortir de la boucle
    //         }
    //     }
    // } while (parseError);

    // Utiliser 'reponseAssistant' pour le reste de votre code ici


    console.log("reponseAssistant ", reponseAssistant);


    console.log("completion data : ", completion.data.choices[0].message.content);


    // Stockez les informations de choix
    if (errorParse == false) {
        choixPrecedents = {
            mauvaisChoixA: reponseAssistant.mauvaisChoixA,
            mauvaisChoixB: reponseAssistant.mauvaisChoixB,
            mauvaisChoixC: reponseAssistant.mauvaisChoixC
        };
        // incremente indice de question
        indexQuestion += 1;

        // * Add the new bot message to the conversation history
        conversationHistory.push({ role: "assistant", content: completion.data.choices[0].message.content });


        return completion.data.choices[0].message.content;
    }
    else {
        return JSON.stringify({ "erreur": "JSON" });
    }
}

function resetConversation() {
    // console.log("Historique de conversation : " + conversationHistory);
    conversationHistory = [];
    console.log("conversation effacée");
    indexQuestion = 0;
}


module.exports = { getCompletion, resetConversation };