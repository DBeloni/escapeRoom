import { createInventory } from "./inventory.js";
import { renderInventory } from "./ui.js";
import { ITEMS } from "./items.js";
import { createInput } from "./input.js";

const scenario = document.getElementById("scenario");
const obstacle = document.getElementById("obstacle");
const ground = document.getElementById("ground");
const player = document.getElementById("player");
const inventoryList = document.getElementById("item-list");

const state = {
    x: 0,
    y: 0,
    speed: 6,
    playerSize: 50,
    obstacle: { x: 200, y: 100, width: 80, height: 80 },
    collectionRadius: 60,
    items: ITEMS.map((item) => ({ ...item })),
    inventory: createInventory()
};

const input = createInput({
    onPress: {
        e: collectNearest,
        q: dropFirst
    }
});

function collectNearest() {
    const index = state.items.findIndex((item) =>
        Math.hypot(
            state.x + 25 - (item.x + 15),
            state.y + 25 - (item.y + 15)
        ) <= state.collectionRadius
    );

    if (index !== -1) {
        const item = state.items.splice(index, 1)[0];
        if (!state.inventory.push(item)) {
            state.items.splice(index, 0, item);
        }
        renderInventory(inventoryList, state.inventory.values());
    }
}

function dropFirst() {
    const item = state.inventory.shift();
    if (!item) return;

    state.items.push({ ...item, x: state.x, y: state.y });
    renderInventory(inventoryList, state.inventory.values());
}

function collides(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function update() {
    const nextX = state.x + (input.keys.d ? state.speed : 0) - (input.keys.a ? state.speed : 0);
    const nextY = state.y + (input.keys.s ? state.speed : 0) - (input.keys.w ? state.speed : 0);

    if (!collides(
        { x: nextX, y: nextY, width: state.playerSize, height: state.playerSize },
        state.obstacle
    )) {
        state.x = nextX;
        state.y = nextY;
    }
}

function render() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    scenario.style.backgroundPosition = `${-state.x}px ${-state.y}px`;

    obstacle.style.transform = `translate(${centerX - 25 + state.obstacle.x - state.x}px, ${centerY - 25 + state.obstacle.y - state.y}px)`;
    player.style.transform = `translate(${centerX - 25}px, ${centerY - 25}px)`;

    ground.innerHTML = state.items.map((item) => `
        <div class="ground-item" style="
            background-color: ${item.color};
            transform: translate(${centerX - 25 + item.x - state.x}px, ${centerY - 25 + item.y - state.y}px);
        "></div>
    `).join("");
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

renderInventory(inventoryList, state.inventory.values());
input.bind();
loop();
