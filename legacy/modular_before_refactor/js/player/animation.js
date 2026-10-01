export function updatePlayerAnimation(state, moving, deltaSeconds) {
    if (!moving) {
        state.player.frame = 0;
        state.player.animationTime = 0;
        return;
    }

    state.player.animationTime += deltaSeconds;

    if (state.player.animationTime >= 0.12) {
        state.player.animationTime = 0;
        state.player.frame = (state.player.frame + 1) % 3;
    }
}
