/* Interações do site institucional. Não controla o motor do jogo. */
(function () {
    "use strict";

    function selecionar(seletor, escopo) {
        return (escopo || document).querySelector(seletor);
    }

    function selecionarTodos(seletor, escopo) {
        return Array.from((escopo || document).querySelectorAll(seletor));
    }

    function configurarAno() {
        const elementoAno = selecionar("[data-year]");
        if (elementoAno) {
            elementoAno.textContent = String(new Date().getFullYear());
        }
    }

    function configurarNavegacao() {
        const botaoMenu = selecionar(".nav-toggle");
        const navegacao = selecionar("#site-navigation");

        if (!botaoMenu || !navegacao) {
            return;
        }

        function fecharMenu() {
            botaoMenu.setAttribute("aria-expanded", "false");
            navegacao.classList.remove("is-open");
        }

        botaoMenu.onclick = function () {
            const menuAberto = botaoMenu.getAttribute("aria-expanded") === "true";
            botaoMenu.setAttribute("aria-expanded", String(!menuAberto));
            navegacao.classList.toggle("is-open", !menuAberto);
        };

        const links = selecionarTodos("a", navegacao);
        for (let indice = 0; indice < links.length; indice += 1) {
            links[indice].onclick = fecharMenu;
        }

        document.onkeydown = function (evento) {
            if (evento.key === "Escape") {
                fecharMenu();
            }
        };

        document.onclick = function (evento) {
            const clicouNaNavegacao = navegacao.contains(evento.target);
            const clicouNoBotao = botaoMenu.contains(evento.target);

            if (!clicouNaNavegacao && !clicouNoBotao) {
                fecharMenu();
            }
        };
    }

    function configurarFiltros() {
        const entradas = selecionarTodos("[data-filter-input]");

        for (let indiceEntrada = 0; indiceEntrada < entradas.length; indiceEntrada += 1) {
            configurarFiltro(entradas[indiceEntrada]);
        }
    }

    function configurarFiltro(entrada) {
        const chave = entrada.dataset.filterInput;
        const lista = selecionar('[data-filter-list="' + chave + '"]');

        if (!lista) {
            return;
        }

        const registros = selecionarTodos("[data-search]", lista);
        const contador = selecionar("[data-filter-count]");
        const estadoVazio = selecionar("[data-empty-state]", lista);
        const quantidadeOriginal = registros.length;

        function atualizarFiltro() {
            const termo = entrada.value.trim().toLocaleLowerCase("pt-BR");
            let quantidadeVisivel = 0;

            for (let indice = 0; indice < registros.length; indice += 1) {
                const registro = registros[indice];
                const textoBusca = (registro.dataset.search || "") + " " + registro.textContent;
                const corresponde = textoBusca.toLocaleLowerCase("pt-BR").includes(termo);

                registro.hidden = !corresponde;
                if (corresponde) {
                    quantidadeVisivel += 1;
                }
            }

            if (estadoVazio) {
                estadoVazio.hidden = quantidadeVisivel !== 0;
            }

            if (contador) {
                contador.textContent =
                    String(quantidadeVisivel).padStart(2, "0") +
                    " / " +
                    String(quantidadeOriginal).padStart(2, "0") +
                    " REGISTROS";
            }
        }

        entrada.oninput = atualizarFiltro;
        atualizarFiltro();
    }

    function configurarLightbox() {
        const dialogo = selecionar("[data-lightbox-dialog]");
        if (!dialogo) {
            return;
        }

        const imagem = selecionar("[data-lightbox-image]", dialogo);
        const legenda = selecionar("[data-lightbox-caption]", dialogo);
        const botaoFechar = selecionar("[data-lightbox-close]", dialogo);
        const acionadores = selecionarTodos("[data-lightbox]");

        for (let indice = 0; indice < acionadores.length; indice += 1) {
            configurarAcionadorLightbox(acionadores[indice], imagem, legenda, dialogo);
        }

        if (botaoFechar) {
            botaoFechar.onclick = function () {
                dialogo.close();
            };
        }

        dialogo.onclick = function (evento) {
            if (evento.target === dialogo) {
                dialogo.close();
            }
        };

        dialogo.onclose = function () {
            imagem.removeAttribute("src");
        };
    }

    function configurarAcionadorLightbox(acionador, imagem, legenda, dialogo) {
        acionador.onclick = function () {
            imagem.src = acionador.dataset.lightbox;

            const imagemOriginal = acionador.querySelector("img");
            imagem.alt = imagemOriginal ? imagemOriginal.alt : "Imagem ampliada da galeria";
            legenda.textContent = acionador.dataset.caption || "";

            if (typeof dialogo.showModal === "function") {
                dialogo.showModal();
            }
        };
    }

    function configurarFormularioContato() {
        const formulario = selecionar("[data-fake-form]");
        const status = selecionar("[data-form-status]");

        if (!formulario || !status) {
            return;
        }

        formulario.onsubmit = function (evento) {
            evento.preventDefault();
            if (!formulario.reportValidity()) {
                return;
            }

            const dados = new FormData(formulario);
            const nome = String(dados.get("nome") || "jogador").trim() || "jogador";
            const protocolo = "QP-" + Math.floor(1000 + Math.random() * 9000);

            status.textContent =
                "Transmissão simulada com sucesso, " + nome +
                ". Protocolo " + protocolo + ". Nenhum dado foi enviado.";
            formulario.reset();
        };
    }

    configurarAno();
    configurarNavegacao();
    configurarFiltros();
    configurarLightbox();
    configurarFormularioContato();
})();
