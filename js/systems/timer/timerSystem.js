export function createTimerSystem() {
    let elapsed = 0;
    let running = false;

    return {
        start() {
            running = true;
        },
        stop() {
            running = false;
        },
        reset() {
            elapsed = 0;
        },
        getSeconds() {
            return elapsed;
        },
        update(deltaSeconds) {
            if (running) elapsed += deltaSeconds;
        }
    };
}
