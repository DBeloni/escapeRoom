export function createPuzzleSystem() {
    const puzzles = new Map();

    return {
        register(id, puzzle) {
            puzzles.set(id, puzzle);
        },

        get(id) {
            return puzzles.get(id);
        },

        solve(id, context) {
            const puzzle = puzzles.get(id);
            if (!puzzle) return false;
            return puzzle.solve?.(context) ?? false;
        },

        update() {}
    };
}
