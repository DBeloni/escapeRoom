export function updateCamera(state, view, zoom) {
    const visibleWidth = view.width / zoom;
    const visibleHeight = view.height / zoom;

    state.camera.x = state.player.x - visibleWidth / 2;
    state.camera.y = state.player.y - visibleHeight / 2;

    state.camera.x = Math.max(
        0,
        Math.min(
            state.camera.x,
            state.map.width - visibleWidth
        )
    );

    state.camera.y = Math.max(
        0,
        Math.min(
            state.camera.y,
            state.map.height - visibleHeight
        )
    );
}
