/*
 * Temporizador das hordas.
 * Mantém a contagem independente da lógica de movimentação e deixa um evento
 * disponível para conectar o surgimento dos inimigos em uma etapa futura.
 */
(function () {
    "use strict";

    const phases = [
        { label: "Tempo até a 1ª horda", duration: 2 * 60 },
        { label: "Tempo até a 2ª horda", duration: 90 },
        { label: "Tempo até a 3ª horda", duration: 60 },
        { label: "Tempo até a horda final", duration: 30 }
    ];

    const panel = document.getElementById("hordeTimer");
    const phaseLabel = document.getElementById("hordePhaseLabel");
    const phaseCount = document.getElementById("hordePhaseCount");
    const countdown = document.getElementById("hordeCountdown");
    const status = document.getElementById("hordeTimerStatus");
    const segments = Array.from(
        document.querySelectorAll("[data-horde-segment]")
    );

    let currentPhase = 0;
    let remainingSeconds = phases[0].duration;
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
        const activePhase = phases[currentPhase];
        const timeText = formatTime(remainingSeconds);

        if (phaseLabel) {
            phaseLabel.textContent = isFinished
                ? "Horda final iniciada"
                : activePhase.label;
        }

        if (phaseCount) {
            phaseCount.textContent = isFinished
                ? "ETAPA FINAL"
                : `FASE ${String(currentPhase + 1).padStart(2, "0")} / 04`;
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
                ? "CONTAGEM CONCLUÍDA"
                : running
                    ? "AMEAÇA EM APROXIMAÇÃO"
                    : "CONTAGEM PAUSADA";
        }

        panel.dataset.phase = String(currentPhase + 1);
        panel.dataset.status = isFinished
            ? "complete"
            : running
                ? "running"
                : "paused";

        segments.forEach((segment, index) => {
            const state = isFinished || index < currentPhase
                ? "complete"
                : index === currentPhase
                    ? "current"
                    : "upcoming";

            segment.dataset.state = state;
        });
    }

    function announceHorde(phaseIndex) {
        window.dispatchEvent(new CustomEvent("game:horde-arrival", {
            detail: {
                phase: phaseIndex + 1,
                label: phases[phaseIndex].label
            }
        }));
    }

    function start() {
        currentPhase = 0;
        remainingSeconds = phases[0].duration;
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
        currentPhase = 0;
        remainingSeconds = phases[0].duration;
        running = false;
        finished = false;
        lastRenderedSecond = null;
        render(true);
    }

    function update(deltaSeconds) {
        if (!running || finished || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
            return;
        }

        let elapsed = deltaSeconds;

        // O while também cobre uma atualização que ultrapasse mais de uma fase.
        while (running && elapsed >= remainingSeconds) {
            elapsed -= remainingSeconds;
            remainingSeconds = 0;
            announceHorde(currentPhase);

            if (currentPhase === phases.length - 1) {
                running = false;
                finished = true;
                render(true);
                return;
            }

            currentPhase += 1;
            remainingSeconds = phases[currentPhase].duration;
        }

        remainingSeconds -= elapsed;
        render();
    }

    window.hordeTimer = {
        start,
        stop,
        reset,
        update
    };
})();
