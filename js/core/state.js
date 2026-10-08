export function createGameState() {
    return {
        sceneId: "cidade",
        flags: {
            gameStarted: false,
            mapLoaded: false,
            playerLoaded: false,
            waterLoaded: false,
            debug: false
        },
        map: {
            width: 0,
            height: 0
        },
        camera: {
            x: 0,
            y: 0
        },
        player: {
            x: 650,
            y: 580,
            width: 32,
            height: 37,
            collisionWidth: 20,
            collisionHeight: 14,
            speed: 180,
            direction: "baixo",
            frame: 0,
            animationTime: 0
        },
        loop: {
            previousTime: 0
        },
        world: {
            waterMask: null,
            waterDebugImage: null
        },
        input: {
            keys: {}
        },
        runtime: {
            waterPercent: 0
        }
    };
}
