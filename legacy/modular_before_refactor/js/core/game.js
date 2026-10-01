import { GAME_CONFIG } from "../config/gameConfig.js";
import { createGameState } from "./state.js";
import { createCanvasContext, resizeCanvas } from "./canvas.js";
import { loadAssets } from "./assets.js";
import { bindInput } from "./input.js";
import { createSceneManager } from "./sceneManager.js";
import { startGameLoop } from "./loop.js";
import { configureMap } from "../world/map.js";
import { updateCamera } from "../world/camera.js";
import { buildWaterMask } from "../world/water.js";
import { updatePlayer } from "../player/movement.js";
import { renderPlayer } from "../player/renderer.js";
import { renderDebug } from "../world/debug.js";
import { updateControlsUI, hideLoading } from "../ui/controlsUI.js";
import { createInventorySystem } from "../systems/inventory/inventory.js";
import { createPuzzleSystem } from "../systems/puzzles/puzzleSystem.js";
import { createPointSystem } from "../systems/points/pointSystem.js";
import { createTimerSystem } from "../systems/timer/timerSystem.js";
import { createInteractionSystem } from "../systems/interaction/interactionSystem.js";

export async function startGame() {
    const state = createGameState();
    const view = createCanvasContext();
    const assets = await loadAssets();
    const sceneManager = createSceneManager(state);

    state.player.width = GAME_CONFIG.player.width;
    state.player.height = GAME_CONFIG.player.height;
    state.player.collisionWidth = GAME_CONFIG.player.collisionWidth;
    state.player.collisionHeight = GAME_CONFIG.player.collisionHeight;
    state.player.speed = GAME_CONFIG.player.speed;
    state.runtime.zoom = GAME_CONFIG.zoom;
    state.runtime.drownThresholdPercent = GAME_CONFIG.drownThresholdPercent;

    configureMap(state, assets.map);
    buildWaterMask(state, assets.map);

    state.flags.mapLoaded = true;
    state.flags.playerLoaded = true;

    resizeCanvas(view);
    window.addEventListener("resize", () => {
        resizeCanvas(view);
        updateCamera(state, view, GAME_CONFIG.zoom);
    });

    bindInput(state, {
        onDebugToggle() {
            state.flags.debug = !state.flags.debug;
            updateControlsUI(view, state, sceneManager.current());
        },
        onEscape() {
            const changed = sceneManager.tryEscape();
            if (changed) {
                updateControlsUI(view, state, sceneManager.current());
            }
            return changed;
        }
    });

    // Sistemas já preparados para as próximas implementações.
    const systems = {
        inventory: createInventorySystem(),
        puzzles: createPuzzleSystem(),
        points: createPointSystem(),
        timer: createTimerSystem(),
        interaction: createInteractionSystem()
    };

    state.flags.gameStarted = true;
    state.systems = systems;

    updateCamera(state, view, GAME_CONFIG.zoom);
    updateControlsUI(view, state, sceneManager.current());
    hideLoading(view);

    startGameLoop(
        currentTime => {
            let deltaSeconds = 0;

            if (state.loop.previousTime !== 0) {
                deltaSeconds = (currentTime - state.loop.previousTime) / 1000;
            }

            deltaSeconds = Math.min(deltaSeconds, 0.05);
            state.loop.previousTime = currentTime;

            systems.timer.update(deltaSeconds);
            updatePlayer(state, sceneManager, deltaSeconds);
            updateCamera(state, view, GAME_CONFIG.zoom);

            state.currentSceneBarrierCount =
                sceneManager.current().barriers?.length ?? 0;
        },
        () => renderGame(state, view, assets, sceneManager)
    );
}

function renderGame(state, view, assets, sceneManager) {
    const { context } = view;

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
    context.scale(GAME_CONFIG.zoom, GAME_CONFIG.zoom);

    const scene = sceneManager.current();

    if (scene.id === "cidade") {
        context.drawImage(
            assets.map,
            -state.camera.x,
            -state.camera.y,
            state.map.width,
            state.map.height
        );
    } else {
        context.fillStyle = scene.backgroundColor;
        context.fillRect(
            0,
            0,
            view.width / GAME_CONFIG.zoom,
            view.height / GAME_CONFIG.zoom
        );
    }

    renderPlayer(state, context, assets.player);
    renderDebug(state, view, scene);

    context.restore();
}
