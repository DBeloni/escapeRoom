export function createInput({ onPress = {} } = {}) {
    const keys = Object.create(null);

    function onKeyDown(event) {
        const key = event.key.toLowerCase();
        keys[key] = true;
        onPress[key]?.();
    }

    function onKeyUp(event) {
        delete keys[event.key.toLowerCase()];
    }

    return {
        keys,
        bind() {
            window.addEventListener("keydown", onKeyDown);
            window.addEventListener("keyup", onKeyUp);
        }
    };
}
