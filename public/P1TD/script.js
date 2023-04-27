// Sélectionnez tous les éléments <li> de la liste
const items = document.querySelectorAll('ul li');

// Ajoute un gestionnaire d'événement pour chaque élément <li>
items.forEach(item => {
  item.addEventListener('click', () => {
    // Inverse la classe "completed" de l'élément <li>
    // la méthode toggle() est une méthode JavaScript qui permet 
    // d'ajouter ou de supprimer une classe CSS d'un élément HTML en fonction de son état.
    // La classe "completed" n'est pas une classe CSS prédéfinie, elle est simplement utilisée dans notre exemple pour donner un nom à la classe que nous ajoutons ou supprimons des éléments <li> lorsqu'ils sont cliqués. Vous pouvez utiliser un autre nom pour cette classe si vous le souhaitez, tant que vous utilisez le même nom dans le code HTML, le code CSS et le code JavaScript
    item.classList.toggle('completed');
    console.log("ITEM barré !");

  });
});











// Définition d'un tableau de tâches à faire
const tasks = ['Acheter du lait', 'Appeler le plombier', 'Faire du sport'];

// Stockage du tableau de tâches dans le sessionStorage sous la clé 'tasks'
sessionStorage.setItem('tasks', JSON.stringify(tasks));

// Récupération du tableau depuis le sessionStorage
const storedTasks = JSON.parse(sessionStorage.getItem('tasks'));

// Affichage du tableau dans la console
console.log("HEY !");
console.log("stored : " + storedTasks);




// TESTER local storage
// installer node.js et express pour projet séparément du projet dans github ??
// contourner CORS pour localstorage dans PWA ? cache de service ? websql ?
// tester console log dans le navigateur ?
// Firebase pour pwa tuto https://firebase.google.com/docs/web/pwa?hl=fr


// voir web app install banner pr faciliter l'installation de l'app