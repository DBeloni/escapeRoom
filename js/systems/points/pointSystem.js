export function createPointSystem() {
    let score = 0;

    return {
        get() {
            return score;
        },
        add(value) {
            score += value;
            return score;
        },
        subtract(value) {
            score -= value;
            return score;
        },
        reset() {
            score = 0;
        }
    };
}
