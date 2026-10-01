import { startGame } from "./core/game.js";

startGame().catch(error => {
    console.error(error);

    const loading = document.getElementById("loading");
    if (loading) {
        loading.textContent = error.message;
    }
});
