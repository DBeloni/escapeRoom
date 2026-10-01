export function resetPlayerAnimation(state) {
    state.player.frame = 0;
    state.player.animationTime = 0;
}

export function setPlayerPosition(
    state,
    x,
    y,
    direction = state.player.direction
) {
    state.player.x = x;
    state.player.y = y;
    state.player.direction = direction;
    resetPlayerAnimation(state);
}
