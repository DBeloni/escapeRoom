import { GAME_CONFIG } from "../config/gameConfig.js";

export async function loadAssets() {
    const [map, player] = await Promise.all([
        loadImage(GAME_CONFIG.assets.map),
        loadImage(GAME_CONFIG.assets.player)
    ]);

    return { map, player };
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Erro ao carregar ${src}.`));
        image.src = src;
    });
}
