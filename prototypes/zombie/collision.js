export function collides(a, b) {
    return a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y;
}

export function canOccupy(entity, world) {
    if (
        entity.x < 0 ||
        entity.x + entity.w > world.width ||
        entity.y < 0 ||
        entity.y + entity.h > world.height
    ) {
        return false;
    }

    return !world.obstacles.some((obstacle) => collides(entity, obstacle));
}

export function lineIsClear(x1, y1, x2, y2, w, h, world) {
    const distance = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(distance / 12));

    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const centerX = x1 + (x2 - x1) * t;
        const centerY = y1 + (y2 - y1) * t;

        if (!canOccupy({ x: centerX - w / 2, y: centerY - h / 2, w, h }, world)) {
            return false;
        }
    }

    return true;
}
