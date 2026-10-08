export function createInteractionSystem() {
    return {
        currentTarget: null,

        setTarget(target) {
            this.currentTarget = target;
        },

        clearTarget() {
            this.currentTarget = null;
        },

        interact() {
            this.currentTarget?.interact?.();
        }
    };
}
