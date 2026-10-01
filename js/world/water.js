function looksLikeWater(r, g, b) {
    return b > r * 1.25 && b > g * 1.05 && b > 32 && g > 10;
}

export function buildWaterMask(state, mapImage) {
    const width = state.map.width;
    const height = state.map.height;
    const total = width * height;

    const analysisCanvas = document.createElement("canvas");
    analysisCanvas.width = width;
    analysisCanvas.height = height;

    const analysisContext = analysisCanvas.getContext("2d", {
        willReadFrequently: true
    });

    analysisContext.drawImage(mapImage, 0, 0);
    const data = analysisContext.getImageData(0, 0, width, height).data;
    const candidates = new Uint8Array(total);

    for (let y = 0; y < height; y++) {
        const row = y * width;

        for (let x = 0; x < width; x++) {
            const i = (row + x) * 4;

            if (looksLikeWater(data[i], data[i + 1], data[i + 2])) {
                candidates[row + x] = 1;
            }
        }
    }

    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const seed = (x, y) => {
        const pos = y * width + x;

        if (candidates[pos] === 1) {
            candidates[pos] = 2;
            queue[tail++] = pos;
        }
    };

    for (let x = 0; x < width; x++) {
        seed(x, 0);
        seed(x, height - 1);
    }

    for (let y = 1; y < height - 1; y++) {
        seed(0, y);
        seed(width - 1, y);
    }

    while (head < tail) {
        const pos = queue[head++];
        const x = pos % width;
        const y = Math.floor(pos / width);

        if (x > 0 && candidates[pos - 1] === 1) {
            candidates[pos - 1] = 2;
            queue[tail++] = pos - 1;
        }

        if (x < width - 1 && candidates[pos + 1] === 1) {
            candidates[pos + 1] = 2;
            queue[tail++] = pos + 1;
        }

        if (y > 0 && candidates[pos - width] === 1) {
            candidates[pos - width] = 2;
            queue[tail++] = pos - width;
        }

        if (y < height - 1 && candidates[pos + width] === 1) {
            candidates[pos + width] = 2;
            queue[tail++] = pos + width;
        }
    }

    state.world.waterMask = candidates;
    state.world.waterDebugImage = createWaterDebugImage(candidates, width, height);
}

function createWaterDebugImage(mask, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    const image = context.createImageData(width, height);

    for (let i = 0; i < mask.length; i++) {
        if (mask[i] !== 2) continue;

        const p = i * 4;
        image.data[p] = 0;
        image.data[p + 1] = 140;
        image.data[p + 2] = 255;
        image.data[p + 3] = 145;
    }

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const pos = y * width + x;

            if (mask[pos] !== 2) continue;

            const edge =
                mask[pos - width] !== 2 ||
                mask[pos + width] !== 2 ||
                mask[pos - 1] !== 2 ||
                mask[pos + 1] !== 2;

            if (!edge) continue;

            const p = pos * 4;
            image.data[p] = 0;
            image.data[p + 1] = 255;
            image.data[p + 2] = 255;
            image.data[p + 3] = 230;
        }
    }

    context.putImageData(image, 0, 0);
    return canvas;
}

export function isWaterAt(state, x, y) {
    const mask = state.world.waterMask;

    if (!mask) return false;
    if (x < 0 || y < 0 || x >= state.map.width || y >= state.map.height) return false;

    return mask[Math.floor(y) * state.map.width + Math.floor(x)] === 2;
}

export function waterPercentInsideHitbox(state, hitbox) {
    const startX = Math.max(0, Math.floor(hitbox.x));
    const endX = Math.min(state.map.width, Math.ceil(hitbox.right));
    const startY = Math.max(0, Math.floor(hitbox.y));
    const endY = Math.min(state.map.height, Math.ceil(hitbox.bottom));

    if (endX <= startX || endY <= startY) return 0;

    let waterPixels = 0;
    let totalPixels = 0;

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const px = x + 0.5;
            const py = y + 0.5;

            if (
                px >= hitbox.x &&
                px < hitbox.right &&
                py >= hitbox.y &&
                py < hitbox.bottom
            ) {
                totalPixels++;
                if (isWaterAt(state, px, py)) waterPixels++;
            }
        }
    }

    return totalPixels === 0
        ? 0
        : (waterPixels / totalPixels) * 100;
}

export function checkDrowning(state, scene, hitbox, thresholdPercent, onDrown) {
    if (scene.id !== "cidade" || !state.flags.waterLoaded) return false;

    const percent = waterPercentInsideHitbox(state, hitbox);
    state.runtime.waterPercent = percent;

    if (percent >= thresholdPercent) {
        onDrown?.();
        return true;
    }

    return false;
}
