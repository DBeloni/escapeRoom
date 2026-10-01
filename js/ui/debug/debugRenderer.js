import { getPlayerHitbox } from "../../world/collision.js";
import { waterPercentInsideHitbox } from "../../world/water.js";

export function renderDebug(state, view, scene) {
    if (!state.flags.debug) return;

    const { context } = view;
    const zoom = state.runtime.zoom ?? 1.8;

    if (scene.id === "cidade") {
        if (state.world.waterDebugImage) {
            context.save();
            context.globalAlpha = 1;
            context.drawImage(
                state.world.waterDebugImage,
                -state.camera.x,
                -state.camera.y,
                state.map.width,
                state.map.height
            );
            context.restore();
        }

        for (let i = 0; i < scene.barriers.length; i++) {
            const barrier = scene.barriers[i];
            drawDebugRect(
                state,
                context,
                barrier.x,
                barrier.y,
                barrier.width,
                barrier.height,
                "rgba(255, 45, 45, 0.22)",
                "rgba(255, 70, 70, 0.95)",
                `B${i + 1}`,
                zoom
            );
        }

        drawDebugRect(
            state,
            context,
            scene.door.left,
            scene.door.y - 8,
            scene.door.right - scene.door.left,
            16,
            "rgba(0, 255, 255, 0.16)",
            "rgba(0, 255, 255, 0.95)",
            "PORTA",
            zoom
        );

        context.strokeStyle = "rgba(0, 220, 255, 0.95)";
        context.lineWidth = 3 / zoom;
        context.strokeRect(
            -state.camera.x,
            -state.camera.y,
            state.map.width,
            state.map.height
        );
    }

    const bodyX = state.player.x - state.player.width / 2;
    const bodyY = state.player.y - state.player.height / 2;

    drawDebugRect(
        state,
        context,
        bodyX,
        bodyY,
        state.player.width,
        state.player.height,
        "rgba(255, 190, 0, 0.08)",
        "rgba(255, 190, 0, 0.95)",
        "SPRITE",
        zoom
    );

    const hitbox = getPlayerHitbox(state);

    drawDebugRect(
        state,
        context,
        hitbox.x,
        hitbox.y,
        hitbox.width,
        hitbox.height,
        "rgba(50, 255, 90, 0.30)",
        "rgba(50, 255, 90, 1)",
        "HITBOX",
        zoom
    );

    renderPanel(state, view, hitbox);
}

function drawDebugRect(state, context, x, y, width, height, fill, stroke, label, zoom) {
    const screenX = x - state.camera.x;
    const screenY = y - state.camera.y;

    context.fillStyle = fill;
    context.fillRect(screenX, screenY, width, height);

    context.strokeStyle = stroke;
    context.lineWidth = 2 / zoom;
    context.strokeRect(screenX, screenY, width, height);

    if (!label) return;

    context.font = `${11 / zoom}px Arial`;
    context.textBaseline = "top";

    const textWidth = context.measureText(label).width + 6 / zoom;

    context.fillStyle = "rgba(0, 0, 0, 0.78)";
    context.fillRect(screenX, screenY, textWidth, 15 / zoom);

    context.fillStyle = "#ffffff";
    context.fillText(label, screenX + 3 / zoom, screenY + 2 / zoom);
}

function renderPanel(state, view, hitbox) {
    const context = view.context;
    const x = view.width - 252;
    const y = 12;

    context.setTransform(
        view.pixelRatio,
        0,
        0,
        view.pixelRatio,
        0,
        0
    );

    context.fillStyle = "rgba(0, 0, 0, 0.78)";
    context.fillRect(x, y, 240, 112);

    context.fillStyle = "#ffffff";
    context.font = "12px Arial";
    context.textBaseline = "top";

    context.fillText("MODO DEBUG — F3", x + 10, y + 8);
    context.fillText(
        `Jogador: ${Math.round(state.player.x)}, ${Math.round(state.player.y)}`,
        x + 10,
        y + 28
    );
    context.fillText(
        `Hitbox: ${hitbox.width} x ${hitbox.height}`,
        x + 10,
        y + 46
    );
    context.fillText(
        `Sólidas: ${state.metrics.currentBarrierCount}`,
        x + 10,
        y + 64
    );
    context.fillText(
        `Água na hitbox: ${Math.round(waterPercentInsideHitbox(state, hitbox))}%`,
        x + 10,
        y + 82
    );
    context.fillText(
        `Afogamento em: ${state.runtime.drownThresholdPercent ?? 35}%`,
        x + 10,
        y + 100
    );
}
