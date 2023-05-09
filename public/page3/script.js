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
  });
});
