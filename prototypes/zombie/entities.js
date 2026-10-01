import { CONFIG } from "./config.js";

export function createPlayer() {
    return {
        color: "#00e5ff",
        x: CONFIG.world.width / 2 - CONFIG.entitySize / 2,
        y: CONFIG.world.height / 2 - CONFIG.entitySize / 2,
        w: CONFIG.entitySize,
        h: CONFIG.entitySize
    };
}

export function createBot(x, y, index) {
    return {
        color: CONFIG.botColors[index % CONFIG.botColors.length],
        x,
        y,
        w: CONFIG.entitySize,
        h: CONFIG.entitySize,
        vx: 0,
        vy: 0,
        path: [],
        pathTimer: CONFIG.pathRecalculationInterval
    };
}
