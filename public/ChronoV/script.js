const timerLeft = document.getElementById("timerLeft");
const timerRight = document.getElementById("timerRight");
const leftRotation = document.getElementById("leftRotation");
const rightRotation = document.getElementById("rightRotation");
const attemptsLeft = document.getElementById("attemptsL");
const attemptsRight = document.getElementById("attemptsR");
const moyLeft = document.getElementById("moyG");
const moyRight = document.getElementById("moyD");
const resetButton = document.getElementById("reset");

let intervalLeft;
let intervalRight;
let startTimeLeft;
let startTimeRight;
let isRunningLeft = false;
let isRunningRight = false;
let attemptsL = 0;
let attemptsR = 0;
let moyG = 0;
let moyD = 0;


function startTimerLeft() {
    startTimeLeft = new Date();
    // définit un intervalle pour appeler la fonction updateTimerLeft toutes les 100 ms
    intervalLeft = setInterval(updateTimerLeft, 100);
}

function stopTimerLeft() {
    attemptsL++;
    attemptsLeft.textContent = attemptsL;

    // calcul de la moyenne : multiplie la moyenne précédente avec le nombre d'essais -1, ajoute le dernier temps et divise par le nombre d'essais
    moyG = (moyG * (attemptsL - 1) + parseFloat(timerLeft.textContent)) / attemptsL;
    moyLeft.textContent = formatNumber(moyG);
    clearInterval(intervalLeft);
}

// affichage au fur et a mesure du chrono qui défile (appelé par setInterval ttes les 100ms)
function updateTimerLeft() {
    const now = new Date();
    const elapsedTime = now - startTimeLeft;
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const milliseconds = Math.floor(elapsedTime % 1000 / 100);
    timerLeft.textContent = `${pad(seconds)}.${milliseconds}`;
}


function startTimerRight() {
    startTimeRight = new Date();
    intervalRight = setInterval(updateTimerRight, 100);
}

function stopTimerRight() {
    attemptsR++;
    attemptsRight.textContent = attemptsR;
    moyD = (moyD * (attemptsR - 1) + parseFloat(timerRight.textContent)) / attemptsR;
    moyRight.textContent = formatNumber(moyD);
    clearInterval(intervalRight);
}

// formatte comme souhaité car obligé du fait d'écart variable sinon
function formatNumber(number) {
    const formattedNumber = number.toFixed(1);
    const [integerPart, decimalPart] = formattedNumber.split('.');
    const paddedIntegerPart = integerPart.padStart(2, '0');
    return `${paddedIntegerPart}.${decimalPart}`;
}


function updateTimerRight() {
    const now = new Date();
    const elapsedTime = now - startTimeRight;
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const milliseconds = Math.floor(elapsedTime % 1000 / 100);
    timerRight.textContent = `${pad(seconds)}.${milliseconds}`;
}


function pad(number) {
    return number.toString().padStart(2, "0");
}

leftRotation.addEventListener("click", () => {
    if (!isRunningLeft) {
        startTimerLeft();
    } else {
        stopTimerLeft();
    }
    isRunningLeft = !isRunningLeft;
});

rightRotation.addEventListener("click", () => {
    if (!isRunningRight) {
        startTimerRight();
    } else {
        stopTimerRight();
    }
    isRunningRight = !isRunningRight;
});

// ecoute click et lance reset function
resetButton.addEventListener("click", reset);

// faite par copilot
function reset() {
    stopTimerLeft();
    stopTimerRight();
    isRunningLeft = false;
    isRunningRight = false;
    timerLeft.textContent = "00.0";
    timerRight.textContent = "00.0";
    moyG = 0;
    moyD = 0;
    moyLeft.textContent = "00.0";
    moyRight.textContent = "00.0";
    attemptsL = 0;
    attemptsR = 0;
    attemptsLeft.textContent = "0";
    attemptsRight.textContent = "0";
}