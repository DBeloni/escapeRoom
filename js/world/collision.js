export function getPlayerHitbox(state, x = state.player.x, y = state.player.y) {
    const left = x - state.player.collisionWidth / 2;
    const top = y + state.player.height / 2 - state.player.collisionHeight;

    return {
        x: left,
        y: top,
        width: state.player.collisionWidth,
        height: state.player.collisionHeight,
        right: left + state.player.collisionWidth,
        bottom: top + state.player.collisionHeight
    };
}

export function rectanglesOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function hasSolidCollision(state, scene, x, y) {
    const hitbox = getPlayerHitbox(state, x, y);

    if (
        hitbox.x < 0 ||
        hitbox.right > state.map.width ||
        hitbox.y < 0 ||
        hitbox.bottom > state.map.height
    ) {
        return true;
    }

    if (scene.id === "casa") {
        return false;
    }

    for (const [x0, y0, width, height] of scene.barriers ?? []) {
        if (rectanglesOverlap(hitbox, { x: x0, y: y0, width, height })) {
            return true;
        }
    }

    return false;
}
