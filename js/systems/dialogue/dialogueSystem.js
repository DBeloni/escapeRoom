export function createDialogueSystem() {
    let current = null;

    return {
        open(dialogue) {
            current = dialogue;
        },

        close() {
            current = null;
        },

        current() {
            return current;
        },

        update() {}
    };
}
