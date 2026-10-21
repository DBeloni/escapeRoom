import { GAME_CONFIG } from "../config/gameConfig.js";

export async function loadAssets() {
    const map = await loadImage(GAME_CONFIG.assets.map);
    const player = await loadImage(GAME_CONFIG.assets.player);
    const waterWaist = await loadImage(GAME_CONFIG.assets.waterWaist);
    const waterNeck = await loadImage(GAME_CONFIG.assets.waterNeck);
    const drowningBubbles = await loadImage(GAME_CONFIG.assets.drowningBubbles);

    return { map, player, waterWaist, waterNeck, drowningBubbles };
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Erro ao carregar ${src}.`));
        image.src = src;
    });
}
