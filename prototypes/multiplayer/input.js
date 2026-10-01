export function createInput() {
    const keys = Object.create(null);

    window.addEventListener("keydown", (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (event) => {
        delete keys[event.key.toLowerCase()];
    });

    return keys;
}
