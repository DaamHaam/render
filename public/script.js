document.addEventListener("DOMContentLoaded", function () {
    const buttonsContainer = document.getElementById("buttons-container");

    fetch('/api/directories')
        .then(response => response.json())
        .then(directories => {
            // Créez vos boutons ici en utilisant l'array 'directories'
            for (let i = 0; i < directories.length; i++) {
                const button = document.createElement("button");
                button.textContent = directories[i];
                button.addEventListener("click", function () {
                    window.location.href = `${directories[i]}/${directories[i]}.html`;
                });
                buttonsContainer.appendChild(button);
            }
        });
});
