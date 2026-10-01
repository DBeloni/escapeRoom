import { createGame } from "./game.js";
import { createUI } from "./ui.js";
import { renderGame } from "./render.js";

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const ui = createUI();
const game = createGame({ ui });

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

gameLoop();

function gameLoop() {
    game.update();
    renderGame(context, canvas, game);
    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
    if (event.code === "Space" && game.getState().over) {
        game.reset();
    }

    const movementKeys = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    if (game.getState().over && movementKeys.includes(event.key.toLowerCase())) {
        game.reset();
    }
});
