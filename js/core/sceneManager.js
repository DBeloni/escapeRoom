import { SCENES } from "../scenes/sceneRegistry.js";

export function createSceneManager(state) {
    return {
        current() {
            return SCENES[state.sceneId];
        },

        changeTo(sceneId) {
            const scene = SCENES[sceneId];

            if (!scene) {
                throw new Error(`Cena não encontrada: ${sceneId}`);
            }

            const previousSceneId = state.sceneId;
            state.sceneId = sceneId;

            scene.onEnter?.(state, { from: previousSceneId });

            state.input.keys = Object.create(null);
            state.loop.previousTime = 0;
        },

        tryEscape() {
            const scene = this.current();

            if (!scene.parentSceneId) {
                return false;
            }

            this.changeTo(scene.parentSceneId);
            return true;
        }
    };
}
