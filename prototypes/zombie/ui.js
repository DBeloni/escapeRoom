export function createUI() {
    const timer = document.getElementById("timer");
    const instructions = document.getElementById("instructions");
    const botCount = document.getElementById("bot-count");
    const gameOver = document.getElementById("game-over");
    const finalTime = document.getElementById("final-time");
    const spawnAlert = document.getElementById("spawn-alert");

    const keys = Object.create(null);

    window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        keys[key] = true;
    });

    window.addEventListener("keyup", (event) => {
        delete keys[event.key.toLowerCase()];
    });

    return {
        isKeyDown(key) {
            return Boolean(keys[key]);
        },
        setTimer(seconds) {
            const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
            const min = Math.floor(seconds / 60).toString().padStart(2, "0");
            const ms = Math.floor((seconds % 1) * 10);
            timer.textContent = `TEMPO: ${min}:${sec}.${ms}`;
        },
        setInstructions(text, color) {
            instructions.textContent = text;
            instructions.style.color = color;
        },
        setBotCount(count) {
            botCount.textContent = count;
        },
        showGameOver(seconds) {
            const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
            const min = Math.floor(seconds / 60).toString().padStart(2, "0");
            const ms = Math.floor((seconds % 1) * 10);
            finalTime.textContent = `${min}:${sec}.${ms}`;
            gameOver.style.display = "block";
        },
        hideGameOver() {
            gameOver.style.display = "none";
        },
        flashSpawnAlert() {
            spawnAlert.style.display = "block";
            setTimeout(() => {
                spawnAlert.style.display = "none";
            }, 2000);
        }
    };
}
