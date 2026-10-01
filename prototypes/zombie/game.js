import { CONFIG, SIEGE_OFFSETS } from "./config.js";
import { collides, canOccupy, lineIsClear } from "./collision.js";
import { createGrid, findPath } from "./pathfinding.js";
import { createWorld } from "./world.js";
import { createBot, createPlayer } from "./entities.js";

export function createGame({ ui }) {
    const world = createWorld();
    const grid = createGrid(world);
    const player = createPlayer();

    let bots = [];
    let started = false;
    let over = false;
    let elapsed = 0;
    let nextSpawn = CONFIG.firstAdditionalSpawn;
    let lastFrame = performance.now();

    reset();

    function reset() {
        started = false;
        over = false;
        elapsed = 0;
        nextSpawn = CONFIG.firstAdditionalSpawn;
        lastFrame = performance.now();
        player.x = world.width / 2 - CONFIG.entitySize / 2;
        player.y = world.height / 2 - CONFIG.entitySize / 2;
        bots = [
            createBot(150, 150, 0),
            createBot(world.width - 200, world.height - 200, 1)
        ];
        ui.hideGameOver();
        ui.setBotCount(bots.length);
        ui.setTimer(0);
        ui.setInstructions("Mova-se para iniciar a caçada!", "#aaa");
    }

    function start() {
        if (started || over) return;
        started = true;
        ui.setInstructions("SOBREVIVA À MATILHA!", "#ff5555");
    }

    function update() {
        if (over) return;

        const now = performance.now();
        const dt = Math.min((now - lastFrame) / 1000, CONFIG.maxDelta);
        lastFrame = now;

        updatePlayer(dt);

        if (!started) return;

        elapsed += dt;
        ui.setTimer(elapsed);

        if (elapsed >= nextSpawn) spawnBot();
        updateBots(dt);
        resolveBotCollisions();

        if (bots.some((bot) => collides(player, bot))) {
            over = true;
            ui.showGameOver(elapsed);
        }
    }

    function updatePlayer(dt) {
        let dx = 0;
        let dy = 0;

        if (ui.isKeyDown("w") || ui.isKeyDown("arrowup")) dy -= 1;
        if (ui.isKeyDown("s") || ui.isKeyDown("arrowdown")) dy += 1;
        if (ui.isKeyDown("a") || ui.isKeyDown("arrowleft")) dx -= 1;
        if (ui.isKeyDown("d") || ui.isKeyDown("arrowright")) dx += 1;

        if (!dx && !dy) return;

        start();

        const length = Math.hypot(dx, dy);
        dx /= length;
        dy /= length;

        const moveX = dx * CONFIG.playerSpeed * dt;
        const moveY = dy * CONFIG.playerSpeed * dt;

        if (canOccupy({ ...player, x: player.x + moveX }, world)) player.x += moveX;
        if (canOccupy({ ...player, y: player.y + moveY }, world)) player.y += moveY;
    }

    function spawnBot() {
        nextSpawn += CONFIG.spawnInterval;

        const corners = [
            { x: 150, y: 150 },
            { x: world.width - 200, y: 150 },
            { x: 150, y: world.height - 200 },
            { x: world.width - 200, y: world.height - 200 }
        ];

        const best = [...corners]
            .sort((a, b) =>
                Math.hypot(b.x - player.x, b.y - player.y) -
                Math.hypot(a.x - player.x, a.y - player.y)
            )[0];

        bots.push(createBot(best.x, best.y, bots.length));
        ui.setBotCount(bots.length);
        ui.flashSpawnAlert();
    }

    function updateBots(dt) {
        const playerCol = Math.floor((player.x + player.w / 2) / CONFIG.gridSize);
        const playerRow = Math.floor((player.y + player.h / 2) / CONFIG.gridSize);

        bots.forEach((bot, index) => {
            bot.pathTimer += dt;

            if (bot.pathTimer >= CONFIG.pathRecalculationInterval || bot.path.length === 0) {
                bot.pathTimer = 0;

                const offset = SIEGE_OFFSETS[index % SIEGE_OFFSETS.length];
                const targetCol = playerCol + offset.dc;
                const targetRow = playerRow + offset.dr;

                const botCol = Math.floor((bot.x + bot.w / 2) / CONFIG.gridSize);
                const botRow = Math.floor((bot.y + bot.h / 2) / CONFIG.gridSize);

                let path = findPath(grid, botCol, botRow, targetCol, targetRow);
                if (!path.length) path = findPath(grid, botCol, botRow, playerCol, playerRow);

                bot.path = smoothPath(path, bot, world);
            }

            let desiredX = 0;
            let desiredY = 0;

            if (bot.path.length) {
                const target = bot.path[0];
                const bx = bot.x + bot.w / 2;
                const by = bot.y + bot.h / 2;
                const dx = target.x - bx;
                const dy = target.y - by;
                const distance = Math.hypot(dx, dy);

                if (distance < CONFIG.waypointDistance) {
                    bot.path.shift();
                } else if (distance > 0) {
                    desiredX = (dx / distance) * CONFIG.botSpeed;
                    desiredY = (dy / distance) * CONFIG.botSpeed;
                }
            }

            const smoothing = 1 - Math.exp(-CONFIG.steeringSmoothing * dt);
            bot.vx += (desiredX - bot.vx) * smoothing;
            bot.vy += (desiredY - bot.vy) * smoothing;

            if (Math.abs(bot.vx) < 0.5) bot.vx = 0;
            if (Math.abs(bot.vy) < 0.5) bot.vy = 0;

            const nextX = bot.x + bot.vx * dt;
            const nextY = bot.y + bot.vy * dt;

            if (canOccupy({ ...bot, x: nextX }, world)) bot.x = nextX;
            else bot.vx = 0;

            if (canOccupy({ ...bot, y: nextY }, world)) bot.y = nextY;
            else bot.vy = 0;
        });
    }

    function smoothPath(path, bot, worldState) {
        if (path.length <= 1) return path;

        const centerX = bot.x + bot.w / 2;
        const centerY = bot.y + bot.h / 2;
        let startIndex = 0;

        while (
            startIndex < path.length - 1 &&
            Math.hypot(path[startIndex].x - centerX, path[startIndex].y - centerY) < 26
        ) {
            startIndex++;
        }

        const result = [];
        let currentIndex = startIndex;

        while (currentIndex < path.length) {
            let bestIndex = currentIndex;
            const limit = Math.min(path.length - 1, currentIndex + 7);

            for (let i = limit; i > currentIndex; i--) {
                const originX = result.length ? result.at(-1).x : centerX;
                const originY = result.length ? result.at(-1).y : centerY;

                if (lineIsClear(originX, originY, path[i].x, path[i].y, bot.w, bot.h, worldState)) {
                    bestIndex = i;
                    break;
                }
            }

            result.push(path[bestIndex]);
            if (bestIndex >= path.length - 1) break;
            currentIndex = bestIndex + 1;
        }

        return result;
    }

    function resolveBotCollisions() {
        for (let i = 0; i < bots.length; i++) {
            for (let j = i + 1; j < bots.length; j++) {
                const a = bots[i];
                const b = bots[j];

                if (!collides(a, b)) continue;

                const acx = a.x + a.w / 2;
                const acy = a.y + a.h / 2;
                const bcx = b.x + b.w / 2;
                const bcy = b.y + b.h / 2;
                const overlapX = a.w / 2 + b.w / 2 - Math.abs(acx - bcx);
                const overlapY = a.h / 2 + b.h / 2 - Math.abs(acy - bcy);
                const factor = 0.35;

                if (overlapX < overlapY) {
                    const direction = acx < bcx ? -1 : 1;
                    const push = overlapX * factor;

                    if (canOccupy({ ...a, x: a.x + push * direction }, world)) a.x += push * direction;
                    if (canOccupy({ ...b, x: b.x - push * direction }, world)) b.x -= push * direction;

                    a.vx *= 0.7;
                    b.vx *= 0.7;
                } else {
                    const direction = acy < bcy ? -1 : 1;
                    const push = overlapY * factor;

                    if (canOccupy({ ...a, y: a.y + push * direction }, world)) a.y += push * direction;
                    if (canOccupy({ ...b, y: b.y - push * direction }, world)) b.y -= push * direction;

                    a.vy *= 0.7;
                    b.vy *= 0.7;
                }
            }
        }
    }

    return {
        getState() {
            return { world, player, bots, over, started, elapsed };
        },
        update,
        reset
    };
}
