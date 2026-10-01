export function startGameLoop({ update, render }) {
    function frame(currentTime) {
        update(currentTime);
        render();
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}
