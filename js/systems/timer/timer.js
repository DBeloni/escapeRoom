/*
 * Cronômetro de cinco minutos.
 * O script principal chama update() durante o jogo.
 */
(() => {
    const TEMPO_TOTAL = 5 * 60;

    const painel = document.querySelector("#endTimer");
    const contador = document.querySelector("#endCountdown");
    const status = document.querySelector("#endTimerStatus");
    const segmentos = document.querySelectorAll("[data-end-segment]");

    let tempoRestante = TEMPO_TOTAL;
    let ativo = false;
    let finalizado = false;
    let ultimoInstante = 0;

    function formatarTempo(segundos) {
        const tempo = Math.max(0, Math.ceil(segundos));
        const minutos = Math.floor(tempo / 60);
        const resto = tempo % 60;

        return `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
    }

    function atualizarTela() {
        if (!painel) return;

        const texto = formatarTempo(tempoRestante);
        const [minutos, segundos] = texto.split(":").map(Number);

        if (contador) {
            contador.textContent = texto;
            contador.setAttribute("datetime", `PT${minutos}M${segundos}S`);
            contador.setAttribute("aria-label", `Tempo restante: ${texto}`);
        }

        if (status) {
            if (finalizado) {
                status.textContent = "EXPOSIÇÃO FATAL";
            } else {
                status.textContent = ativo ? "EXPOSIÇÃO CRÍTICA" : "CONTAGEM PAUSADA";
            }
        }

        painel.dataset.status = finalizado ? "complete" : ativo ? "running" : "paused";

        segmentos.forEach(segmento => {
            segmento.dataset.state = finalizado ? "complete" : "current";
        });
    }

    function iniciar() {
        tempoRestante = TEMPO_TOTAL;
        ativo = true;
        finalizado = false;
        ultimoInstante = performance.now();

        if (painel) painel.hidden = false;
        atualizarTela();
    }

    function parar() {
        if (ativo) {
            const agora = performance.now();
            tempoRestante -= (agora - ultimoInstante) / 1000;
        }

        ativo = false;
        atualizarTela();
    }

    function reiniciar() {
        tempoRestante = TEMPO_TOTAL;
        ativo = false;
        finalizado = false;
        atualizarTela();
    }

    function atualizar() {
        if (!ativo) return;

        const agora = performance.now();
        tempoRestante -= (agora - ultimoInstante) / 1000;
        ultimoInstante = agora;

        if (tempoRestante <= 0) {
            tempoRestante = 0;
            ativo = false;
            finalizado = true;
            window.finalizarJogo?.("infectado");
        }

        atualizarTela();
    }

    // O jogo usa estes quatro comandos para controlar o cronômetro.
    window.hordeTimer = {
        start: iniciar,
        stop: parar,
        reset: reiniciar,
        update: atualizar
    };
})();
