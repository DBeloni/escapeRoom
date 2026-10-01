export const CONFIG = {
    world: { width: 2600, height: 1800 },
    gridSize: 50,
    playerSpeed: 480,
    botSpeed: 336,
    pathRecalculationInterval: 0.24,
    steeringSmoothing: 10,
    waypointDistance: 18,
    entitySize: 44,
    firstAdditionalSpawn: 15,
    spawnInterval: 15,
    maxDelta: 0.033,
    botColors: ["#a855f7", "#ff0055", "#ff9900", "#eab308", "#10b981", "#ec4899", "#3b82f6"]
};

export const SIEGE_OFFSETS = [
    { dc: -3, dr: 0 },
    { dc: 3, dr: 0 },
    { dc: 0, dr: -3 },
    { dc: 0, dr: 3 },
    { dc: -2, dr: -2 },
    { dc: 2, dr: 2 },
    { dc: 2, dr: -2 },
    { dc: -2, dr: 2 }
];
