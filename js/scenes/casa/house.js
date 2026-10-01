import { GAME_CONFIG } from "../../config/gameConfig.js";

export const HOUSE_SCENE = {
    id: "casa",
    name: "Casa",
    parentSceneId: "cidade",
    backgroundColor: "#292c34",

    onEnter(state) {
        state.player.x = GAME_CONFIG.player.spawn.x;
        state.player.y = GAME_CONFIG.player.spawn.y;
        state.player.direction = "cima";
        state.player.frame = 0;
        state.player.animationTime = 0;
    }
};
