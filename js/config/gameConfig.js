export const GAME_CONFIG = {
    zoom: 1.8,
    drownThresholdPercent: 35,
    assets: {
        map: "../assets/maps/mapa.png",
        player: "../assets/maps/personagem.png"
    },
    player: {
        width: 32,
        height: 37,
        collisionWidth: 20,
        collisionHeight: 14,
        speed: 180,
        spawn: { x: 650, y: 580 }
    }
};
