import { GAME_CONFIG } from "../config/gameConfig.js";
import { createGameState } from "./state.js";
import { createCanvasView, resizeCanvas } from "./canvas.js";
import { loadAssets } from "./assets.js";
import { bindInput } from "./input.js";
import { startGameLoop } from "./loop.js";
import { createSceneManager } from "./sceneManager.js";
import { configureMap } from "../world/map/map.js";
import { updateCamera } from "../world/camera.js";
import { buildWaterMask } from "../world/water.js";
import { updatePlayer } from "../entities/player/movement.js";
import { renderPlayer } from "../entities/player/render.js";
import { renderDebug } from "../ui/debug/debugRenderer.js";
import { updateHud, hideLoading } from "../ui/hud.js";
import { createGameSystems } from "../systems/registry.js";

export async function startGame() {
    const state = createGameState();
    const view = createCanvasView();
    const assets = await loadAssets();
    const sceneManager = createSceneManager(state);

    configurePlayerState(state);
    configureMap(state, assets.map);
    buildWaterMask(state, assets.map);

    state.flags.mapLoaded = true;
    state.flags.playerLoaded = true;
    state.flags.waterLoaded = true;

    resizeCanvas(view);
    window.addEventListener("resize", () => {
        resizeCanvas(view);
        updateCamera(state, view, GAME_CONFIG.render.zoom);
    });

    state.systems = createGameSystems(state);

    bindInput(state, {
        onDebugToggle() {
            state.flags.debug = !state.flags.debug;
            updateHud(view, state, sceneManager.current());
        },
        onEscape() {
            const changed = sceneManager.tryEscape();
            if (changed) {
                updateHud(view, state, sceneManager.current());
            }
            return changed;
        }
    });

    state.flags.gameStarted = true;

    updateCamera(state, view, GAME_CONFIG.render.zoom);
    updateHud(view, state, sceneManager.current());
    hideLoading(view);

    startGameLoop({
        update(currentTime) {
            const deltaSeconds = calculateDelta(state, currentTime);

            state.systems.timer.update(deltaSeconds);
            state.systems.interaction.update(deltaSeconds);
            state.systems.dialogue.update(deltaSeconds);
            state.systems.quests.update(deltaSeconds);
            state.systems.puzzles.update(deltaSeconds);

            updatePlayer(state, sceneManager, deltaSeconds);
            updateCamera(state, view, GAME_CONFIG.render.zoom);

            const scene = sceneManager.current();
            state.metrics.currentBarrierCount = scene.barriers?.length ?? 0;
        },
        render() {
            renderGame(state, view, assets, sceneManager);
        }
    });
}

function configurePlayerState(state) {
    state.player.width = GAME_CONFIG.player.width;
    state.player.height = GAME_CONFIG.player.height;
    state.player.collisionWidth = GAME_CONFIG.player.collisionWidth;
    state.player.collisionHeight = GAME_CONFIG.player.collisionHeight;
    state.player.speed = GAME_CONFIG.player.speed;
    state.player.x = GAME_CONFIG.player.spawn.x;
    state.player.y = GAME_CONFIG.player.spawn.y;
    state.player.direction = GAME_CONFIG.player.spawn.direction;
    state.runtime.zoom = GAME_CONFIG.render.zoom;
    state.runtime.drownThresholdPercent = GAME_CONFIG.drowning.thresholdPercent;
}

function calculateDelta(state, currentTime) {
    if (state.loop.previousTime === 0) {
        state.loop.previousTime = currentTime;
        return 0;
    }

    const delta = Math.min(
        (currentTime - state.loop.previousTime) / 1000,
        0.05
    );

    state.loop.previousTime = currentTime;
    return delta;
}

function renderGame(state, view, assets, sceneManager) {
    const context = view.context;

    context.setTransform(
        view.pixelRatio,
        0,
        0,
        view.pixelRatio,
        0,
        0
    );

    context.clearRect(0, 0, view.width, view.height);
    context.save();
    context.scale(GAME_CONFIG.render.zoom, GAME_CONFIG.render.zoom);

    const scene = sceneManager.current();

    if (scene.backgroundAsset === "map") {
        context.drawImage(
            assets.map,
            -state.camera.x,
            -state.camera.y,
            state.map.width,
            state.map.height
        );
    } else {
        context.fillStyle = scene.backgroundColor ?? "#292c34";
        context.fillRect(
            0,
            0,
            view.width / GAME_CONFIG.render.zoom,
            view.height / GAME_CONFIG.render.zoom
        );
    }

    scene.renderWorld?.({ state, view, context });
    renderPlayer(state, context, assets.player);
    scene.renderForeground?.({ state, view, context });
    renderDebug(state, view, scene);

    context.restore();
}
