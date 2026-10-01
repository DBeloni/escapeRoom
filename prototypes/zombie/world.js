import { CONFIG } from "./config.js";

export function createWorld() {
    return {
        width: CONFIG.world.width,
        height: CONFIG.world.height,
        obstacles: [
            { x: CONFIG.world.width / 2 - 200, y: CONFIG.world.height / 2 - 250, w: 400, h: 100 },
            { x: CONFIG.world.width / 2 - 200, y: CONFIG.world.height / 2 + 150, w: 400, h: 100 },
            { x: 350, y: 350, w: 220, h: 180 },
            { x: CONFIG.world.width - 570, y: CONFIG.world.height - 530, w: 220, h: 180 },
            { x: 650, y: 1100, w: 300, h: 100 },
            { x: CONFIG.world.width - 910, y: 450, w: 100, h: 300 }
        ]
    };
}
