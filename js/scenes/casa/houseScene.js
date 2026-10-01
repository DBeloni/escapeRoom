export const HOUSE_SCENE = {
    id: "casa",
    name: "Casa",
    parentSceneId: "cidade",
    backgroundColor: "#292c34",

    onEnter(state) {
        state.player.x = 650;
        state.player.y = 580;
        state.player.direction = "cima";
        state.player.frame = 0;
        state.player.animationTime = 0;
    }
};
