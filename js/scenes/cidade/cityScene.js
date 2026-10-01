import { GAME_CONFIG } from "../../config/gameConfig.js";
import { CITY_BARRIERS, CITY_DOOR } from "./barriers.js";

export const CITY_SCENE = {
    id: "cidade",
    name: "Cidade",
    parentSceneId: null,
    backgroundAsset: "map",
    spawn: { ...GAME_CONFIG.player.spawn },
    barriers: CITY_BARRIERS,
    door: CITY_DOOR,

    onEnter(state, context = {}) {
        if (context.from === "casa") {
            state.player.x = 198;
            state.player.y = 605;
            state.player.direction = "baixo";
            state.player.frame = 0;
            state.player.animationTime = 0;
        }
    },

    shouldEnterHouse(state, nextY) {
        const half = state.player.collisionWidth / 2;
        const insideDoor =
            state.player.x + half >= this.door.left &&
            state.player.x - half <= this.door.right;

        return insideDoor && state.player.y >= this.door.y && nextY <= this.door.y;
    }
};
