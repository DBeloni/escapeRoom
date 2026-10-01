export function updateCamera(state, view, zoom) {
    const visibleWidth = view.width / zoom;
    const visibleHeight = view.height / zoom;

    state.camera.x = state.player.x - visibleWidth / 2;
    state.camera.y = state.player.y - visibleHeight / 2;

    state.camera.x = clamp(
        state.camera.x,
        0,
        Math.max(0, state.map.width - visibleWidth)
    );

    state.camera.y = clamp(
        state.camera.y,
        0,
        Math.max(0, state.map.height - visibleHeight)
    );
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
