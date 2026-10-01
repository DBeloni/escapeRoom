export function createPuzzleSystem() {
    return {
        solved: new Set(),

        solve(puzzleId) {
            this.solved.add(puzzleId);
        },

        isSolved(puzzleId) {
            return this.solved.has(puzzleId);
        }
    };
}
