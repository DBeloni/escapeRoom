export function bindInput(state, handlers = {}) {
    window.addEventListener("keydown", event => {
        const key = event.key.toLowerCase();

        if (key === "f3") {
            handlers.onDebugToggle?.();
            event.preventDefault();
            return;
        }

        if (key === "escape") {
            const handled = handlers.onEscape?.();
            if (handled) return;
        }

        state.input.keys[key] = true;

        if (key.startsWith("arrow")) {
            event.preventDefault();
        }
    });

    window.addEventListener("keyup", event => {
        state.input.keys[event.key.toLowerCase()] = false;
    });

    window.addEventListener("blur", () => {
        state.input.keys = {};
    });
}
