import { GAME_CONFIG } from "../../config/gameConfig.js";
import { getPlayerHitbox, hasSolidCollision } from "../../world/collision.js";
import { checkDrowning } from "../../world/water.js";
import { updatePlayerAnimation } from "./animation.js";
import { setPlayerPosition } from "./player.js";

export function updatePlayer(state, sceneManager, deltaSeconds) {
    let horizontal = 0;
    let vertical = 0;
    const keys = state.input.keys;

    if (keys.d || keys.arrowright) horizontal++;
    if (keys.a || keys.arrowleft) horizontal--;
    if (keys.s || keys.arrowdown) vertical++;
    if (keys.w || keys.arrowup) vertical--;

    updateDirection(state, horizontal, vertical);

    if (horizontal !== 0 && vertical !== 0) {
        horizontal /= Math.sqrt(2);
        vertical /= Math.sqrt(2);
    }

    const scene = sceneManager.current();
    const nextX = state.player.x + horizontal * state.player.speed * deltaSeconds;
    const nextY = state.player.y + vertical * state.player.speed * deltaSeconds;

    if (scene.id === "cidade" && vertical < 0 && scene.shouldEnterHouse(state, nextY)) {
        sceneManager.changeTo("casa");
        return;
    }

    let moving = false;

    if (!hasSolidCollision(state, scene, nextX, state.player.y)) {
        moving ||= nextX !== state.player.x;
        state.player.x = nextX;
    }

    if (!hasSolidCollision(state, scene, state.player.x, nextY)) {
        moving ||= nextY !== state.player.y;
        state.player.y = nextY;
    }

    const hitbox = getPlayerHitbox(state);

    checkDrowning(
        state,
        scene,
        hitbox,
        GAME_CONFIG.drowning.thresholdPercent,
        () => {
            const spawn = GAME_CONFIG.player.spawn;
            setPlayerPosition(state, spawn.x, spawn.y, spawn.direction);
        }
    );

    updatePlayerAnimation(state, moving, deltaSeconds);
}

function updateDirection(state, horizontal, vertical) {
    if (horizontal < 0) state.player.direction = "esquerda";
    else if (horizontal > 0) state.player.direction = "direita";
    else if (vertical < 0) state.player.direction = "cima";
    else if (vertical > 0) state.player.direction = "baixo";
}
