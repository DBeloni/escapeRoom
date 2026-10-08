export function createTimerSystem() {
    return {
        running: false,
        elapsed: 0,

        start() {
            this.running = true;
        },

        stop() {
            this.running = false;
        },

        reset() {
            this.elapsed = 0;
            this.running = false;
        },

        update(deltaSeconds) {
            if (this.running) {
                this.elapsed += deltaSeconds;
            }
        }
    };
}
