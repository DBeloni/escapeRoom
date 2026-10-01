import { CONFIG } from "./config.js";
import { createInput } from "./input.js";
import { renderViewport } from "./render.js";
import { tryMovePlayer } from "./physics.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const keys = createInput();

const world = { ...CONFIG.world };
const obstacle = {
    x: world.width / 2 - 40,
    y: world.height / 2 - 40,
    w: 80,
    h: 80
};

const players = [
    { id: 1, color: "blue", x: world.width / 2 - 100, y: world.height / 2, w: CONFIG.playerSize, h: CONFIG.playerSize, keys: { up: "w", down: "s", left: "a", right: "d" } },
    { id: 2, color: "green", x: world.width / 2 + 100, y: world.height / 2, w: CONFIG.playerSize, h: CONFIG.playerSize, keys: { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" } }
];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function update() {
    players.forEach((player, index) => {
        let dx = 0;
        let dy = 0;
        const binding = player.keys;

        if (keys[binding.up]) dy -= CONFIG.speed;
        if (keys[binding.down]) dy += CONFIG.speed;
        if (keys[binding.left]) dx -= CONFIG.speed;
        if (keys[binding.right]) dx += CONFIG.speed;

        const other = players[index === 0 ? 1 : 0];
        tryMovePlayer(player, dx, dy, world, obstacle, other);
    });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const [p1, p2] = players;
    const distanceX = Math.abs(p1.x - p2.x);
    const distanceY = Math.abs(p1.y - p2.y);

    if (
        distanceX > canvas.width * CONFIG.splitDistanceX ||
        distanceY > canvas.height * CONFIG.splitDistanceY
    ) {
        const halfWidth = canvas.width / 2;

        renderViewport(ctx, 0, 0, halfWidth, canvas.height, p1.x + p1.w / 2, p1.y + p1.h / 2, world, obstacle, players);
        renderViewport(ctx, halfWidth, 0, halfWidth, canvas.height, p2.x + p2.w / 2, p2.y + p2.h / 2, world, obstacle, players);

        ctx.fillStyle = "#222";
        ctx.fillRect(halfWidth - 3, 0, 6, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(halfWidth - 1, 0, 2, canvas.height);
        return;
    }

    const centerX = (p1.x + p2.x + p1.w) / 2;
    const centerY = (p1.y + p2.y + p1.h) / 2;
    renderViewport(ctx, 0, 0, canvas.width, canvas.height, centerX, centerY, world, obstacle, players);
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
resize();
loop();
