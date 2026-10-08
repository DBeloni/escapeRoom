export function createPointSystem() {
    return {
        total: 0,

        add(amount) {
            this.total += amount;
        },

        reset() {
            this.total = 0;
        }
    };
}
