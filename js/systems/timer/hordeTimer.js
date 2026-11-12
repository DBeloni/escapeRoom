/*
 * Contagem regressiva do tempo de exposição à radiação.
 */
(function () {
    "use strict";

    const DURATION_SECONDS = 5 * 60;

    const panel = document.getElementById("hordeTimer");
    const phaseLabel = document.getElementById("hordePhaseLabel");
    const countdown = document.getElementById("hordeCountdown");
    const status = document.getElementById("hordeTimerStatus");
    const segments = Array.from(
        document.querySelectorAll("[data-horde-segment]")
    );

    let remainingSeconds = DURATION_SECONDS;
    let running = false;
    let finished = false;
    let lastRenderedSecond = null;

    function formatTime(totalSeconds) {
        const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
        const minutes = Math.floor(safeSeconds / 60);
        const seconds = safeSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function render(force = false) {
        if (!panel) return;

        const displayedSecond = Math.ceil(remainingSeconds);
        if (!force && displayedSecond === lastRenderedSecond) return;
        lastRenderedSecond = displayedSecond;

        const isFinished = finished;
        const timeText = formatTime(remainingSeconds);

        if (phaseLabel) {
            phaseLabel.textContent = "Tempo até a radiação matar";
        }

        if (countdown) {
            const roundedSeconds = Math.max(0, Math.ceil(remainingSeconds));
            const minutes = Math.floor(roundedSeconds / 60);
            const seconds = roundedSeconds % 60;

            countdown.textContent = timeText;
            countdown.setAttribute("datetime", `PT${minutes}M${seconds}S`);
            countdown.setAttribute(
                "aria-label",
                `Tempo restante: ${timeText}`
            );
        }

        if (status) {
            status.textContent = isFinished
                ? "EXPOSIÇÃO FATAL"
                : running
                    ? "EXPOSIÇÃO CRÍTICA"
                    : "CONTAGEM PAUSADA";
        }

        panel.dataset.status = isFinished
            ? "complete"
            : running
                ? "running"
                : "paused";

        segments.forEach(segment => {
            segment.dataset.state = isFinished ? "complete" : "current";
        });
    }

    function start() {
        remainingSeconds = DURATION_SECONDS;
        running = true;
        finished = false;
        lastRenderedSecond = null;

        if (panel) panel.hidden = false;
        render(true);
    }

    function stop() {
        running = false;
        render(true);
    }

    function reset() {
        remainingSeconds = DURATION_SECONDS;
        running = false;
        finished = false;
        lastRenderedSecond = null;
        render(true);
    }

    function update(deltaSeconds) {
        if (!running || finished || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
            return;
        }

        remainingSeconds -= deltaSeconds;
        if (remainingSeconds <= 0) {
            remainingSeconds = 0;
            running = false;
            finished = true;
        }
        render();
    }

    window.hordeTimer = {
        start,
        stop,
        reset,
        update
    };
})();
