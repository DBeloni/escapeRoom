/*
 * Cronômetro de cinco minutos.
 * O script principal chama update() durante o jogo.
 */
(function () {
    "use strict";

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

        return String(minutos).padStart(2, "0") + ":" + String(resto).padStart(2, "0");
    }

    function atualizarStatus() {
        if (!status) {
            return;
        }

        if (finalizado) {
            status.textContent = "EXPOSIÇÃO FATAL";
        } else if (ativo) {
            status.textContent = "EXPOSIÇÃO CRÍTICA";
        } else {
            status.textContent = "CONTAGEM PAUSADA";
        }
    }

    function atualizarSegmentos() {
        for (let indice = 0; indice < segmentos.length; indice += 1) {
            segmentos[indice].dataset.state = finalizado ? "complete" : "current";
        }
    }

    function atualizarTela() {
        if (!painel) {
            return;
        }

        const texto = formatarTempo(tempoRestante);
        const separador = texto.indexOf(":");
        const minutos = Number(texto.slice(0, separador));
        const segundos = Number(texto.slice(separador + 1));

        if (contador) {
            contador.textContent = texto;
            contador.setAttribute("datetime", "PT" + minutos + "M" + segundos + "S");
            contador.setAttribute("aria-label", "Tempo restante: " + texto);
        }

        atualizarStatus();
        painel.dataset.status = finalizado ? "complete" : (ativo ? "running" : "paused");
        atualizarSegmentos();
    }

    function iniciar() {
        tempoRestante = TEMPO_TOTAL;
        ativo = true;
        finalizado = false;
        ultimoInstante = performance.now();

        if (painel) {
            painel.hidden = false;
        }

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
        ultimoInstante = 0;
        if (painel) painel.hidden = true;
        atualizarTela();
    }

    function atualizar() {
        if (!ativo) {
            return;
        }

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

    // Mantém os mesmos quatro comandos usados pelo script principal.
    window.hordeTimer = {
        start: iniciar,
        stop: parar,
        reset: reiniciar,
        update: atualizar
    };
})();
