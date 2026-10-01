export const GAME_CONFIG = {
    debug: {
        enabledByDefault: false
    },

    render: {
        zoom: 1.8
    },

    drowning: {
        thresholdPercent: 35
    },

    assets: {
        map: "assets/maps/mapa.png",
        player: "assets/maps/personagem.png"
    },

    player: {
        width: 32,
        height: 37,
        collisionWidth: 20,
        collisionHeight: 14,
        speed: 180,
        spawn: {
            scene: "cidade",
            x: 650,
            y: 580,
            direction: "baixo"
        }
    }
};
