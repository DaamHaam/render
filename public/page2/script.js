// JavaScript file for the simple calculation exercise

function generateRandomNumber() {
  // Returns a random integer between 1 and 10
  return Math.floor(Math.random() * 10) + 1;
}

// function generateQuestion() {
//   // Generates a simple arithmetic question
//   let num1 = generateRandomNumber();
//   let num2 = generateRandomNumber();
//   let operator = ["+", "-", "\u00D7", "\u00F7"][Math.floor(Math.random() * 4)];
//   let question = num1 + " " + operator + " " + num2;
//   return question;
// }

function checkAnswer(question, userAnswer) {
  // Checks the user's answer to the question
  let answer = eval(question);
  return answer == userAnswer;
}