import { getCompletion } from './chatCompletion.js';

async function run() {
    const result = await getCompletion("Salut ça va ?");
    console.log(result);
}

run();
