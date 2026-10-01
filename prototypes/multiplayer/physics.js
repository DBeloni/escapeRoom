export function overlaps(a, b) {
    return a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y;
}

export function tryMovePlayer(player, dx, dy, world, obstacle, other) {
    if (dx !== 0) {
        const nextX = player.x + dx;
        if (canOccupy({ ...player, x: nextX }, world, obstacle)) {
            if (overlaps({ ...player, x: nextX }, other)) {
                if (canOccupy({ ...other, x: other.x + dx }, world, obstacle)) {
                    other.x += dx;
                } else {
                    return;
                }
            }
            player.x = nextX;
        }
    }

    if (dy !== 0) {
        const nextY = player.y + dy;
        if (canOccupy({ ...player, y: nextY }, world, obstacle)) {
            if (overlaps({ ...player, y: nextY }, other)) {
                if (canOccupy({ ...other, y: other.y + dy }, world, obstacle)) {
                    other.y += dy;
                } else {
                    return;
                }
            }
            player.y = nextY;
        }
    }
}

export function canOccupy(entity, world, obstacle) {
    return entity.x >= 0 &&
        entity.x + entity.w <= world.width &&
        entity.y >= 0 &&
        entity.y + entity.h <= world.height &&
        !overlaps(entity, obstacle);
}
