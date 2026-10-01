export function bindInput(state, handlers = {}) {
    function onKeyDown(event) {
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
    }

    function onKeyUp(event) {
        delete state.input.keys[event.key.toLowerCase()];
    }

    function onBlur() {
        state.input.keys = Object.create(null);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
    };
}
