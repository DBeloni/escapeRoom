export function createInteractionSystem() {
    let target = null;

    return {
        setTarget(value) {
            target = value;
        },

        clearTarget() {
            target = null;
        },

        getTarget() {
            return target;
        },

        interact(context) {
            return target?.interact?.(context) ?? false;
        },

        update() {}
    };
}
