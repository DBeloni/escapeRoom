// 1. Pegamos a tela do jogo. O contexto permite desenhar nela.
const canvas = document.getElementById("gameCanvas");
const contexto = canvas.getContext("2d");
const aviso = document.getElementById("loading");
const controles = document.getElementById("controls");

// Cada opção é independente: o mapa atual continua intacto e a Zona Costeira
// pode ser testada pelo seletor no canto superior direito.
const mapasDisponiveis = {
    atual: {
        id: "atual",
        nome: "Quarantine Protocol",
        src: "../assets/maps/mapa.png",
        spawn: { x: 650, y: 580 },
        usaLayoutOriginal: true
    },
    remaster: {
        id: "remaster",
        nome: "Remaster — Zona Costeira",
        src: "../assets/maps/mapa-remaster-zona-costeira.png",
        spawn: { x: 620, y: 620 },
        usaLayoutOriginal: false,
        bloqueiaAgua: true
    }
};

const mapaSolicitado = new URLSearchParams(window.location.search).get("map");
const mapaSelecionado = mapasDisponiveis[mapaSolicitado] ?? mapasDisponiveis.atual;

// O tamanho real do mapa é atualizado quando mapa.png termina de carregar.
let larguraMapa = 0;
let alturaMapa = 0;
const zoom = 1.8;
const imagemMapa = new Image();
const imagemPersonagem = new Image();

// Um objeto agrupa informações. Exemplo: jogador.x é a posição horizontal.
const jogador = {
    x: mapaSelecionado.spawn.x,
    y: mapaSelecionado.spawn.y,
    largura: 32,
    altura: 37,

    // Área usada na colisão. Ela fica nos pés do personagem.
    larguraColisao: 20,
    alturaColisao: 14,

    velocidade: 180,
    direcao: "baixo",
    quadro: 0,
    tempoAnimacao: 0
};

let teclas = {};
let cameraX = 0;
let cameraY = 0;
let larguraTela = 0;
let alturaTela = 0;
let escalaPixels = 1;
let tempoAnterior = 0;
let mapaCarregado = false;
let personagemCarregado = false;
let aguaCarregada = false;
let jogoIniciado = false;
let modoDebug = false;

// ============================================================================
// CONTROLES PARA CELULAR
// ============================================================================
// O computador continua usando teclado. No celular, o mesmo estado `teclas`
// é alimentado por um joystick virtual e por botões equivalentes a F3/Esc.
const entradaMobile = {
    ativa: false,
    pointerId: null,
    centroX: 0,
    centroY: 0,
    raio: 48,
    maxDeslocamento: 34
};

const teclasMovimento = ["w", "a", "s", "d"];

function dispositivoPareceTouch() {
    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
}

function limparEntradaMobile() {
    entradaMobile.ativa = false;
    entradaMobile.pointerId = null;

    for (const tecla of teclasMovimento) {
        delete teclas[tecla];
    }

    const thumb = document.getElementById("mobileJoystickThumb");
    if (thumb) {
        thumb.style.transform = "translate(-50%, -50%)";
    }
}

function atualizarJoystickMobile(clientX, clientY) {
    const dx = clientX - entradaMobile.centroX;
    const dy = clientY - entradaMobile.centroY;
    const distancia = Math.hypot(dx, dy);
    const limite = entradaMobile.maxDeslocamento;
    const fator = distancia > limite ? limite / distancia : 1;
    const deslocamentoX = dx * fator;
    const deslocamentoY = dy * fator;

    // Zera as teclas do joystick antes de aplicar a direção atual.
    for (const tecla of teclasMovimento) {
        delete teclas[tecla];
    }

    const deadZone = 10;

    if (Math.abs(dx) > deadZone) {
        if (dx > 0) teclas.d = true;
        else teclas.a = true;
    }

    if (Math.abs(dy) > deadZone) {
        if (dy > 0) teclas.s = true;
        else teclas.w = true;
    }

    const thumb = document.getElementById("mobileJoystickThumb");
    if (thumb) {
        thumb.style.transform = `translate(calc(-50% + ${deslocamentoX}px), calc(-50% + ${deslocamentoY}px))`;
    }
}

function configurarControlesMobile() {
    const joystick = document.getElementById("mobileJoystick");
    const ring = joystick?.querySelector(".mobile-joystick-ring");
    const debugButton = document.getElementById("mobileDebug");
    const backButton = document.getElementById("mobileBack");

    if (!joystick || !ring || !debugButton || !backButton) {
        return;
    }

    // Em aparelho touch deixamos os controles sempre visíveis.
    if (dispositivoPareceTouch()) {
        document.body.classList.add("touch-device");
    }

    function iniciarJoystick(evento) {
        entradaMobile.ativa = true;
        entradaMobile.pointerId = evento.pointerId;

        const rect = ring.getBoundingClientRect();
        entradaMobile.centroX = rect.left + rect.width / 2;
        entradaMobile.centroY = rect.top + rect.height / 2;
        entradaMobile.raio = Math.min(rect.width, rect.height) / 2;

        joystick.setPointerCapture?.(evento.pointerId);
        atualizarJoystickMobile(evento.clientX, evento.clientY);
        evento.preventDefault();
    }

    function moverJoystick(evento) {
        if (!entradaMobile.ativa || evento.pointerId !== entradaMobile.pointerId) {
            return;
        }

        atualizarJoystickMobile(evento.clientX, evento.clientY);
        evento.preventDefault();
    }

    function finalizarJoystick(evento) {
        if (evento.pointerId !== entradaMobile.pointerId) {
            return;
        }

        limparEntradaMobile();
        evento.preventDefault();
    }

    joystick.addEventListener("pointerdown", iniciarJoystick, { passive: false });
    joystick.addEventListener("pointermove", moverJoystick, { passive: false });
    joystick.addEventListener("pointerup", finalizarJoystick, { passive: false });
    joystick.addEventListener("pointercancel", finalizarJoystick, { passive: false });
    joystick.addEventListener("lostpointercapture", limparEntradaMobile);

    debugButton.addEventListener("click", () => {
        alternarModoDebug();
    });

    backButton.addEventListener("click", () => {
        if (cenarioAtual === "casa") {
            mudarCenario("cidade");
        } else {
            // Fora da casa, o botão funciona como um equivalente seguro de Esc:
            // em vez de fechar a página, volta para a página anterior quando existir.
            if (window.history.length > 1) {
                window.history.back();
            }
        }
    });

    window.addEventListener("touchmove", event => {
        if (event.target.closest?.("#mobileControls")) {
            event.preventDefault();
        }
    }, { passive: false });

    window.addEventListener("pagehide", limparEntradaMobile);
    window.addEventListener("blur", limparEntradaMobile);
}

// O cenário pode ser "cidade" ou "casa".
let cenarioAtual = "cidade";

// Spawn usado quando o jogador se afoga.
const spawn = { ...mapaSelecionado.spawn };

// Entrada da casa do mapa principal.
const portaEsquerda = 160;
const portaDireita = 236;
const portaY = 575;

// Entradas visíveis e abertas da Zona Costeira.
// Cada porta deixa um corredor livre na barreira da construção.
const portasZonaCosteira = [
    { id: "casa-costeira-01", left: 337, right: 372, y: 394, spawnY: 412 }, // casa superior esquerda
    { id: "casa-costeira-02", left: 722, right: 760, y: 422, spawnY: 440 }, // casa superior direita
    { id: "casa-costeira-03", left: 512, right: 548, y: 589, spawnY: 607 }, // hospital central
    { id: "casa-costeira-04", left: 608, right: 645, y: 767, spawnY: 785 }, // hospital azul
    { id: "casa-costeira-05", left: 948, right: 988, y: 679, spawnY: 697 }  // casa da direita
];

// Cada porta da Zona Costeira tem seu próprio mapa interno. As imagens são
// pré-carregadas para a troca de cenário acontecer sem tela preta ao entrar.
const interioresZonaCosteira = {
    "casa-costeira-01": {
        nome: "Casa 01",
        src: "../assets/maps/casa-01-zona-costeira-interior.png"
    },
    "casa-costeira-02": {
        nome: "Casa 02",
        src: "../assets/maps/casa-02-zona-costeira-interior.png"
    },
    "casa-costeira-03": {
        nome: "Casa 03 — Clínica",
        src: "../assets/maps/casa-03-zona-costeira-interior.png"
    },
    "casa-costeira-04": {
        nome: "Casa 04 — Enfermaria",
        src: "../assets/maps/casa-04-zona-costeira-interior.png"
    },
    "casa-costeira-05": {
        nome: "Casa 05 — Oficina",
        src: "../assets/maps/casa-05-zona-costeira-interior.png"
    }
};

let interiorAtual = null;
let larguraCidade = 0;
let alturaCidade = 0;

for (const interior of Object.values(interioresZonaCosteira)) {
    const imagem = new Image();

    imagem.onload = () => {
        if (interiorAtual === interior) {
            aplicarDimensoesDoCenario(imagem);
            posicionarJogadorNaEntradaInterna();
            atualizarCamera();
        }
    };

    imagem.src = interior.src;
    interior.imagem = imagem;
}

// Última porta usada, para o Esc devolver o jogador exatamente à entrada.
let ultimaPortaEntrada = null;

// Quanto da hitbox precisa estar na água para o jogador se afogar.
const porcentagemAfogamento = 35;


// ============================================================================
// ÁGUA DO MAPA
// ============================================================================
// A água é detectada diretamente na imagem do mapa. A Zona Costeira também
// considera lagoas internas, para que elas sejam exibidas no F3 e bloqueiem
// a passagem do jogador.

let mascaraAgua = null;
let imagemAguaDebug = null;

function pixelEhAguaProvavel(r, g, b) {
    // A água do mapa vai de azul profundo a verde-azulado com vegetação.
    // O critério tolera reflexos e folhas na superfície, mas exige azul acima
    // do vermelho para não confundir terra, madeira e pedra com água.
    return (
        b > r * 1.25 &&
        b >= g &&
        b > 32 &&
        g > 10
    );
}

function criarMascaraAgua() {
    const largura = larguraMapa;
    const altura = alturaMapa;
    const total = largura * altura;

    const canvasAnalise = document.createElement("canvas");
    canvasAnalise.width = largura;
    canvasAnalise.height = altura;

    const contextoAnalise = canvasAnalise.getContext("2d", {
        willReadFrequently: true
    });

    contextoAnalise.drawImage(imagemMapa, 0, 0);

    const dados = contextoAnalise.getImageData(
        0,
        0,
        largura,
        altura
    ).data;

    // 0 = não parece água
    // 1 = candidata ainda não classificada
    // 2 = oceano conectado à borda
    // 3 = lagoa interna grande (usada na Zona Costeira)
    const candidatos = new Uint8Array(total);

    for (let y = 0; y < altura; y++) {
        const linha = y * largura;

        for (let x = 0; x < largura; x++) {
            const indicePixel = (linha + x) * 4;

            const r = dados[indicePixel];
            const g = dados[indicePixel + 1];
            const b = dados[indicePixel + 2];

            if (pixelEhAguaProvavel(r, g, b)) {
                candidatos[linha + x] = 1;
            }
        }
    }

    // A água do oceano chega às bordas do mapa.
    // Fazemos um flood fill para manter somente a água realmente conectada
    // ao oceano e eliminar falsos positivos, como poças decorativas.
    const fila = new Int32Array(total);

    let inicioFila = 0;
    let fimFila = 0;

    function adicionarSemente(x, y) {
        const posicao = y * largura + x;

        if (candidatos[posicao] === 1) {
            candidatos[posicao] = 2;
            fila[fimFila] = posicao;
            fimFila++;
        }
    }

    // Parte de cima e de baixo.
    for (let x = 0; x < largura; x++) {
        adicionarSemente(x, 0);
        adicionarSemente(x, altura - 1);
    }

    // Lado esquerdo e direito.
    for (let y = 1; y < altura - 1; y++) {
        adicionarSemente(0, y);
        adicionarSemente(largura - 1, y);
    }

    while (inicioFila < fimFila) {
        const posicao = fila[inicioFila];
        inicioFila++;

        const x = posicao % largura;
        const y = Math.floor(posicao / largura);

        // Esquerda
        if (x > 0) {
            const esquerda = posicao - 1;

            if (candidatos[esquerda] === 1) {
                candidatos[esquerda] = 2;
                fila[fimFila] = esquerda;
                fimFila++;
            }
        }

        // Direita
        if (x < largura - 1) {
            const direita = posicao + 1;

            if (candidatos[direita] === 1) {
                candidatos[direita] = 2;
                fila[fimFila] = direita;
                fimFila++;
            }
        }

        // Cima
        if (y > 0) {
            const acima = posicao - largura;

            if (candidatos[acima] === 1) {
                candidatos[acima] = 2;
                fila[fimFila] = acima;
                fimFila++;
            }
        }

        // Baixo
        if (y < altura - 1) {
            const abaixo = posicao + largura;

            if (candidatos[abaixo] === 1) {
                candidatos[abaixo] = 2;
                fila[fimFila] = abaixo;
                fimFila++;
            }
        }
    }

    if (mapaSelecionado.bloqueiaAgua) {
        removerCandidatosEmConstrucoes(candidatos, largura);
        classificarLagoasInternas(candidatos, largura, altura);
    }

    mascaraAgua = candidatos;

    // Criamos a camada azul usada pelo modo debug.
    const canvasDebug = document.createElement("canvas");
    canvasDebug.width = largura;
    canvasDebug.height = altura;

    const contextoDebug = canvasDebug.getContext("2d");
    const camada = contextoDebug.createImageData(largura, altura);

    for (let i = 0; i < total; i++) {
        if (mascaraAgua[i] === 2 || mascaraAgua[i] === 3) {
            const indicePixel = i * 4;

            camada.data[indicePixel] = 25;
            camada.data[indicePixel + 1] = 145;
            camada.data[indicePixel + 2] = 255;

            camada.data[indicePixel + 3] = 92;
        }
    }

    contextoDebug.putImageData(camada, 0, 0);

    imagemAguaDebug = canvasDebug;
    aguaCarregada = true;
}

function removerCandidatosEmConstrucoes(candidatos, largura) {
    // O telhado azul do mercado possui tons parecidos com água. Ele já tem
    // barreira física própria, então não deve aparecer como área alagada no F3.
    const regioesSolidas = [
        [568, 640, 152, 126]
    ];

    for (const [x, y, larguraRegiao, alturaRegiao] of regioesSolidas) {
        for (let py = y; py < y + alturaRegiao; py++) {
            const inicio = py * largura + x;
            candidatos.fill(0, inicio, inicio + larguraRegiao);
        }
    }
}

function classificarLagoasInternas(candidatos, largura, altura) {
    const total = largura * altura;
    const fila = new Int32Array(total);
    const areaMinimaDeAgua = 1000;

    for (let inicio = 0; inicio < total; inicio++) {
        if (candidatos[inicio] !== 1) continue;

        let inicioFila = 0;
        let fimFila = 1;
        fila[0] = inicio;
        candidatos[inicio] = 4;

        while (inicioFila < fimFila) {
            const posicao = fila[inicioFila++];
            const x = posicao % largura;
            const y = Math.floor(posicao / largura);

            const vizinhos = [
                x > 0 ? posicao - 1 : -1,
                x < largura - 1 ? posicao + 1 : -1,
                y > 0 ? posicao - largura : -1,
                y < altura - 1 ? posicao + largura : -1
            ];

            for (const vizinho of vizinhos) {
                if (vizinho >= 0 && candidatos[vizinho] === 1) {
                    candidatos[vizinho] = 4;
                    fila[fimFila++] = vizinho;
                }
            }
        }

        const tipoFinal = fimFila >= areaMinimaDeAgua ? 3 : 0;
        for (let indice = 0; indice < fimFila; indice++) {
            candidatos[fila[indice]] = tipoFinal;
        }
    }
}

function pixelEhAgua(x, y) {
    if (mascaraAgua === null) {
        return false;
    }

    if (
        x < 0 ||
        y < 0 ||
        x >= larguraMapa ||
        y >= alturaMapa
    ) {
        return false;
    }

    const tipo = mascaraAgua[
        Math.floor(y) * larguraMapa + Math.floor(x)
    ];

    return tipo === 2 || tipo === 3;
}

function porcentagemHitboxNaAgua(x, y) {
    const hitbox = obterHitboxJogador(x, y);

    const inicioX = Math.max(0, Math.floor(hitbox.x));
    const fimX = Math.min(
        larguraMapa,
        Math.ceil(hitbox.direita)
    );

    const inicioY = Math.max(0, Math.floor(hitbox.y));
    const fimY = Math.min(
        alturaMapa,
        Math.ceil(hitbox.base)
    );

    if (
        fimX <= inicioX ||
        fimY <= inicioY
    ) {
        return 0;
    }

    let pixelsNaAgua = 0;
    let pixelsTotais = 0;

    // A hitbox é pequena, então podemos analisar pixel por pixel.
    // Isso deixa a porcentagem muito mais precisa.
    for (let py = inicioY; py < fimY; py++) {
        for (let px = inicioX; px < fimX; px++) {

            const centroX = px + 0.5;
            const centroY = py + 0.5;

            if (
                centroX >= hitbox.x &&
                centroX < hitbox.direita &&
                centroY >= hitbox.y &&
                centroY < hitbox.base
            ) {
                pixelsTotais++;

                if (pixelEhAgua(centroX, centroY)) {
                    pixelsNaAgua++;
                }
            }
        }
    }

    if (pixelsTotais === 0) {
        return 0;
    }

    return (
        pixelsNaAgua / pixelsTotais
    ) * 100;
}


// ============================================================================
// CENÁRIO / PORTA
// ============================================================================

function aplicarDimensoesDoCenario(imagem) {
    larguraMapa = imagem.naturalWidth;
    alturaMapa = imagem.naturalHeight;
}

function obterLimitesTransitaveisDaCasa() {
    // As artes internas têm uma margem externa preta para enquadramento. A
    // área útil começa logo depois das paredes e termina antes da soleira.
    return {
        esquerda: Math.round(larguraMapa * 0.04),
        direita: Math.round(larguraMapa * 0.96),
        topo: Math.round(alturaMapa * 0.03),
        base: Math.round(alturaMapa * 0.88)
    };
}

function obterSaidaDaCasa() {
    const larguraDaPorta = Math.max(52, Math.round(larguraMapa * 0.09));

    return {
        esquerda: Math.round((larguraMapa - larguraDaPorta) / 2),
        direita: Math.round((larguraMapa + larguraDaPorta) / 2),
        y: Math.round(alturaMapa * 0.85)
    };
}

function posicionarJogadorNaEntradaInterna() {
    jogador.x = Math.round(larguraMapa / 2);
    jogador.y = Math.round(alturaMapa * 0.76);
}

function tentarSairDaCasa(x, y, novoY, vertical) {
    if (
        cenarioAtual !== "casa" ||
        interiorAtual === null ||
        vertical <= 0
    ) {
        return false;
    }

    const saida = obterSaidaDaCasa();
    const estaNaPorta =
        x + jogador.larguraColisao / 2 >= saida.esquerda &&
        x - jogador.larguraColisao / 2 <= saida.direita;

    return (
        estaNaPorta &&
        y <= saida.y &&
        novoY >= saida.y
    );
}

function mudarCenario(destino, porta = null) {
    cenarioAtual = destino;

    if (destino === "casa") {

        if (mapaSelecionado.usaLayoutOriginal) {
            interiorAtual = null;
            jogador.x = 650;
            jogador.y = 580;
        } else if (porta) {
            interiorAtual = interioresZonaCosteira[porta.id] ?? null;
            ultimaPortaEntrada = porta;

            if (
                interiorAtual !== null &&
                interiorAtual.imagem.naturalWidth > 0
            ) {
                aplicarDimensoesDoCenario(interiorAtual.imagem);
                posicionarJogadorNaEntradaInterna();
            } else {
                // Caso a imagem ainda esteja baixando, o onload acima conclui
                // a troca sem interromper o jogo.
                jogador.x = larguraMapa / 2;
                jogador.y = alturaMapa * 0.76;
            }
        }

        jogador.direcao = "cima";

        atualizarTextoControles();

    } else {

        // A câmera e os limites voltam a usar o mapa externo antes de colocar
        // o jogador na saída da casa.
        aplicarDimensoesDoCenario({
            naturalWidth: larguraCidade,
            naturalHeight: alturaCidade
        });
        interiorAtual = null;

        if (
            mapaSelecionado.usaLayoutOriginal ||
            ultimaPortaEntrada === null
        ) {
            jogador.x = 198;
            jogador.y = 605;
        } else {
            jogador.x = (
                ultimaPortaEntrada.left +
                ultimaPortaEntrada.right
            ) / 2;
            jogador.y = ultimaPortaEntrada.spawnY;
        }

        jogador.direcao = "baixo";

        atualizarTextoControles();
    }

    teclas = {};

    jogador.quadro = 0;
    jogador.tempoAnimacao = 0;

    tempoAnterior = 0;

    atualizarCamera();
}


// ============================================================================
// BARREIRAS
// ============================================================================
// Cada obstáculo é:
//
// [x, y, largura, altura]

const obstaculos = [

    // Prédios e fileira do topo
    [40, 34, 181, 130],
    [224, 5, 192, 162],
    [421, 37, 141, 127],
    [567, 43, 141, 118],
    [711, 39, 158, 129],

    [109, 158, 38, 25],
    [153, 164, 47, 33],
    [210, 166, 56, 29],
    [271, 164, 79, 33],
    [357, 164, 51, 33],
    [416, 164, 39, 33],
    [459, 147, 57, 43],

    // Floresta, cerca e limite da direita
    [523, 0, 828, 115],
    [872, 120, 405, 58],
    [1278, 86, 73, 514],

    // Quintal cercado
    [951, 214, 243, 8],
    [951, 434, 243, 8],
    [949, 214, 8, 228],
    [1188, 214, 8, 228],

    [1005, 241, 52, 38],
    [1040, 296, 75, 62],
    [1175, 215, 19, 76],

    [970, 391, 44, 44],
    [1098, 421, 30, 26],

    // Centro e muro
    [739, 393, 147, 164],
    [705, 512, 25, 30],
    [858, 247, 61, 48],
    [533, 212, 127, 66],
    [907, 507, 365, 55],
    [1237, 477, 31, 31],
    [1013, 590, 32, 32],

    // Casas da esquerda
    [151, 419, 187, 141],
    [127, 425, 25, 80],
    [97, 508, 53, 47],
    [251, 549, 57, 27],
    [422, 435, 138, 125],
    [560, 465, 20, 85],
    [514, 549, 33, 29],
    [367, 582, 110, 58],

    // Galpão inferior esquerdo
    [148, 651, 273, 182],
    [123, 706, 27, 106],
    [42, 745, 82, 62],
    [424, 745, 66, 62],
    [329, 829, 30, 24],

    // Casa laranja pequena
    [753, 684, 146, 118],
    [820, 665, 22, 22],
    [877, 665, 16, 22],
    [736, 764, 19, 28],
    [827, 791, 60, 30],

    // Prédio do píer e barricadas
    [1051, 664, 105, 145],
    [1029, 725, 29, 93],
    [1151, 725, 30, 93],
    [1040, 678, 30, 30],
    [1042, 924, 108, 99],
    [1018, 950, 27, 60],

    // Portão inferior
    [534, 1057, 54, 107],
    [710, 1057, 50, 107],
    [588, 1080, 123, 72]
];

function criarPoligonoSolido(pontos) {
    return {
        tipo: "poligono",
        pontos: pontos.map(([x, y]) => ({ x, y }))
    };
}

function normalizarObstaculo(obstaculo) {
    if (Array.isArray(obstaculo)) {
        return {
            tipo: "retangulo",
            x: obstaculo[0],
            y: obstaculo[1],
            largura: obstaculo[2],
            altura: obstaculo[3]
        };
    }

    return obstaculo;
}

// Colisões da Zona Costeira (1375 × 1144).
// Só entram elementos com limite físico contínuo e inequívoco: água,
// falésias, paredes de construções e cercas fechadas. Objetos decorativos,
// vegetação, veículos, pedras soltas, escadas e pontes são atravessáveis.
const obstaculosZonaCosteira = [
    // ===== ROCHAS / PENHASCOS =====
    // Norte + canto nordeste + paredão esquerdo (topo)
    criarPoligonoSolido([
        [48, 0], [1375, 0], [1375, 340], [890, 340], [890, 320],
        [693, 320], [693, 125], [258, 125], [258, 345], [178, 345],
        [178, 178], [48, 178]
    ]),
    // Paredão esquerdo da praia (escada em x 258–345 fica livre)
    [235, 345, 23, 338],
    // Degraus do sudoeste (entre a praia e a cidade)
    criarPoligonoSolido([
        [345, 655], [490, 655], [490, 860], [600, 860], [600, 910],
        [720, 910], [720, 1060], [692, 1060], [692, 938], [575, 938],
        [575, 885], [465, 885], [465, 683], [345, 683]
    ]),
    // Margens de pedra em volta do lago grande (a água fica por conta da máscara)
    [890, 320, 285, 58],  // faixa de cima
    [890, 378, 30, 197],  // faixa da esquerda
    [920, 545, 170, 30],  // margem de baixo
    // Plataforma rochosa sul/leste + paredão direito + borda da área dos laguinhos
    criarPoligonoSolido([
        [720, 915], [890, 915], [890, 768], [915, 768], [915, 890],
        [1175, 890], [1175, 340], [1375, 340], [1375, 1144],
        [692, 1144], [692, 1060], [720, 1060]
    ]),
    // Muro entre a casa da direita e a área dos laguinhos (escada em x 945–1002 fica livre)
    [915, 768, 30, 32],
    [1002, 768, 88, 32],
    // Muro leste da casa da direita
    [1062, 575, 28, 200],

    // ===== CERCA DO JARDIM =====
    [260, 143, 432, 16],  // topo
    [260, 143, 14, 252],  // esquerda
    [678, 143, 14, 194],  // direita
    [508, 320, 184, 14],  // base direita
    [508, 320, 10, 52],
    [260, 380, 60, 15],   // base esquerda
    // Postes do portão de entrada (vão livre em x 454–489)
    [433, 372, 21, 22],
    [489, 372, 21, 22],

    // ===== CASAS (porta = vão livre na fachada) =====
    // Casa superior esquerda (laranja)
    [318, 297, 110, 62],
    [318, 359, 19, 38],
    [372, 359, 56, 38],

    // Casa superior direita (roxa)
    [688, 328, 142, 62],
    [688, 390, 34, 35],
    [760, 390, 70, 35],

    // Hospital central (cruz vermelha)
    [460, 470, 138, 65],
    [460, 535, 52, 57],
    [548, 535, 50, 57],

    // Hospital inferior azul
    [572, 657, 116, 58],
    [572, 715, 36, 55],
    [645, 715, 43, 55],

    // Casa da direita (roxa)
    [920, 585, 138, 55],
    [920, 640, 28, 42],
    [988, 640, 70, 42],

    // Casa inferior central (roxa): porta fechada/tapada
    [688, 668, 142, 98],

    // Prédio do píer: sólido inteiro
    [205, 828, 195, 150],

    // ===== ÁRVORES =====
    [836, 318, 50, 297],  // fileira de pinheiros vertical
    [545, 335, 50, 95],   // pinheiro do jardim
    [412, 485, 45, 62],   // pinheiro perto do hospital
    [605, 822, 226, 90],  // pinheiros do sul

    // ===== CARROS E OBJETOS =====
    [290, 248, 56, 38],   // carro no jardim
    [288, 420, 58, 40],   // carro abaixo da casa
    [162, 582, 28, 46],   // carro na praia
    [165, 690, 50, 45],   // guindaste na areia
    [376, 528, 26, 38],   // veículo pequeno
    [440, 556, 16, 28],   // pneus
    [888, 630, 28, 48]    // ambulância
];

function obterObstaculosAtivos() {
    return mapaSelecionado.usaLayoutOriginal
        ? obstaculos
        : obstaculosZonaCosteira;
}

function obterPortaZonaCosteira(x, y, novoY) {
    if (
        mapaSelecionado.usaLayoutOriginal ||
        cenarioAtual !== "cidade" ||
        novoY >= y
    ) {
        return null;
    }

    for (const porta of portasZonaCosteira) {
        const dentroDaPorta =
            x + jogador.larguraColisao / 2 >= porta.left &&
            x - jogador.larguraColisao / 2 <= porta.right;

        if (
            dentroDaPorta &&
            y >= porta.y &&
            novoY <= porta.y
        ) {
            return porta;
        }
    }

    return null;
}


// ============================================================================
// TELA
// ============================================================================

function ajustarTela() {
    const tamanho = canvas.getBoundingClientRect();

    larguraTela = tamanho.width;
    alturaTela = tamanho.height;

    escalaPixels = window.devicePixelRatio || 1;

    canvas.width = Math.floor(
        larguraTela * escalaPixels
    );

    canvas.height = Math.floor(
        alturaTela * escalaPixels
    );

    contexto.imageSmoothingEnabled = false;

    atualizarCamera();
}


// ============================================================================
// HITBOX
// ============================================================================

function obterHitboxJogador(x, y) {
    const esquerda =
        x - jogador.larguraColisao / 2;

    const topo =
        y +
        jogador.altura / 2 -
        jogador.alturaColisao;

    return {
        x: esquerda,
        y: topo,
        largura: jogador.larguraColisao,
        altura: jogador.alturaColisao,

        direita:
            esquerda +
            jogador.larguraColisao,

        base:
            topo +
            jogador.alturaColisao
    };
}

function retangulosColidem(a, b) {
    return (
        a.x < b.x + b.largura &&
        a.x + a.largura > b.x &&
        a.y < b.y + b.altura &&
        a.y + a.altura > b.y
    );
}

function pontoDentroDoPoligono(ponto, pontos) {
    let dentro = false;

    for (let i = 0, j = pontos.length - 1; i < pontos.length; j = i++) {
        const atual = pontos[i];
        const anterior = pontos[j];
        const cruzaLinhaHorizontal =
            (atual.y > ponto.y) !== (anterior.y > ponto.y);

        if (
            cruzaLinhaHorizontal &&
            ponto.x <
                ((anterior.x - atual.x) * (ponto.y - atual.y)) /
                    (anterior.y - atual.y) + atual.x
        ) {
            dentro = !dentro;
        }
    }

    return dentro;
}

function segmentosSeCruzam(a, b, c, d) {
    const orientacao = (p1, p2, p3) =>
        (p2.x - p1.x) * (p3.y - p1.y) -
        (p2.y - p1.y) * (p3.x - p1.x);

    const abC = orientacao(a, b, c);
    const abD = orientacao(a, b, d);
    const cdA = orientacao(c, d, a);
    const cdB = orientacao(c, d, b);

    return (
        ((abC > 0 && abD < 0) || (abC < 0 && abD > 0)) &&
        ((cdA > 0 && cdB < 0) || (cdA < 0 && cdB > 0))
    );
}

function retanguloColideComPoligono(retangulo, pontos) {
    const cantos = [
        { x: retangulo.x, y: retangulo.y },
        { x: retangulo.direita, y: retangulo.y },
        { x: retangulo.direita, y: retangulo.base },
        { x: retangulo.x, y: retangulo.base }
    ];

    if (cantos.some(canto => pontoDentroDoPoligono(canto, pontos))) {
        return true;
    }

    if (
        pontos.some(ponto =>
            ponto.x >= retangulo.x &&
            ponto.x <= retangulo.direita &&
            ponto.y >= retangulo.y &&
            ponto.y <= retangulo.base
        )
    ) {
        return true;
    }

    for (let i = 0; i < pontos.length; i++) {
        const inicio = pontos[i];
        const fim = pontos[(i + 1) % pontos.length];

        for (let lado = 0; lado < cantos.length; lado++) {
            const inicioLado = cantos[lado];
            const fimLado = cantos[(lado + 1) % cantos.length];

            if (segmentosSeCruzam(inicio, fim, inicioLado, fimLado)) {
                return true;
            }
        }
    }

    return false;
}

function obstaculoColideComHitbox(obstaculo, hitbox) {
    const colisor = normalizarObstaculo(obstaculo);

    if (colisor.tipo === "poligono") {
        return retanguloColideComPoligono(hitbox, colisor.pontos);
    }

    return retangulosColidem(hitbox, colisor);
}


// ============================================================================
// AFOGAMENTO
// ============================================================================

function verificarAfogamento() {

    if (
        cenarioAtual !== "cidade" ||
        aguaCarregada === false
    ) {
        return false;
    }

    const porcentagemNaAgua =
        porcentagemHitboxNaAgua(
            jogador.x,
            jogador.y
        );

    if (
        porcentagemNaAgua >=
        porcentagemAfogamento
    ) {

        jogador.x = spawn.x;
        jogador.y = spawn.y;

        jogador.direcao = "baixo";

        jogador.quadro = 0;
        jogador.tempoAnimacao = 0;

        atualizarCamera();

        return true;
    }

    return false;
}


// ============================================================================
// COLISÃO
// ============================================================================

function temColisao(x, y) {

    const hitbox =
        obterHitboxJogador(x, y);

    // O personagem não pode sair do mapa.
    if (
        hitbox.x < 0 ||
        hitbox.direita > larguraMapa ||
        hitbox.y < 0 ||
        hitbox.base > alturaMapa
    ) {
        return true;
    }

    // Os interiores têm uma moldura externa preta fora das paredes. Ela não
    // deve virar uma área onde o personagem possa caminhar.
    if (cenarioAtual === "casa") {
        if (interiorAtual === null) {
            return false;
        }

        const limites = obterLimitesTransitaveisDaCasa();

        if (
            hitbox.x < limites.esquerda ||
            hitbox.direita > limites.direita ||
            hitbox.y < limites.topo ||
            hitbox.base > limites.base
        ) {
            return true;
        }

        return false;
    }

    if (
        mapaSelecionado.bloqueiaAgua &&
        porcentagemHitboxNaAgua(x, y) >= 10
    ) {
        return true;
    }

    const obstaculosAtivos = obterObstaculosAtivos();

    for (
        let i = 0;
        i < obstaculosAtivos.length;
        i++
    ) {
        const obstaculo =
            obstaculosAtivos[i];

        if (
            obstaculoColideComHitbox(obstaculo, hitbox)
        ) {
            return true;
        }
    }

    return false;
}


// ============================================================================
// CÂMERA
// ============================================================================

function atualizarCamera() {

    const larguraVisivel =
        larguraTela / zoom;

    const alturaVisivel =
        alturaTela / zoom;

    cameraX =
        jogador.x -
        larguraVisivel / 2;

    cameraY =
        jogador.y -
        alturaVisivel / 2;

    if (
        cameraX >
        larguraMapa -
        larguraVisivel
    ) {
        cameraX =
            larguraMapa -
            larguraVisivel;
    }

    if (
        cameraY >
        alturaMapa -
        alturaVisivel
    ) {
        cameraY =
            alturaMapa -
            alturaVisivel;
    }

    if (cameraX < 0) {
        cameraX = 0;
    }

    if (cameraY < 0) {
        cameraY = 0;
    }
}


// ============================================================================
// MOVIMENTO
// ============================================================================

function moverJogador(segundos) {

    let horizontal = 0;
    let vertical = 0;

    if (
        teclas.d ||
        teclas.arrowright
    ) {
        horizontal++;
    }

    if (
        teclas.a ||
        teclas.arrowleft
    ) {
        horizontal--;
    }

    if (
        teclas.s ||
        teclas.arrowdown
    ) {
        vertical++;
    }

    if (
        teclas.w ||
        teclas.arrowup
    ) {
        vertical--;
    }

    if (horizontal < 0) {
        jogador.direcao = "esquerda";
    } else if (horizontal > 0) {
        jogador.direcao = "direita";
    } else if (vertical < 0) {
        jogador.direcao = "cima";
    } else if (vertical > 0) {
        jogador.direcao = "baixo";
    }

    // Diagonal com velocidade normalizada.
    if (
        horizontal !== 0 &&
        vertical !== 0
    ) {
        horizontal /=
            Math.sqrt(2);

        vertical /=
            Math.sqrt(2);
    }

    let andou = false;

    const novoX =
        jogador.x +
        horizontal *
        jogador.velocidade *
        segundos;

    const novoY =
        jogador.y +
        vertical *
        jogador.velocidade *
        segundos;

    // Saída pela porta inferior do interior da Zona Costeira.
    if (
        tentarSairDaCasa(
            jogador.x,
            jogador.y,
            novoY,
            vertical
        )
    ) {
        mudarCenario("cidade");
        return;
    }


    // Entrada pela porta do mapa principal.
    if (
        mapaSelecionado.usaLayoutOriginal &&
        cenarioAtual === "cidade" &&
        vertical < 0 &&
        jogador.x +
            jogador.larguraColisao / 2 >=
            portaEsquerda &&
        jogador.x -
            jogador.larguraColisao / 2 <=
            portaDireita &&
        jogador.y >= portaY &&
        novoY <= portaY
    ) {
        mudarCenario("casa");
        return;
    }

    // Entradas pelas portas abertas da Zona Costeira.
    const portaZonaCosteira = obterPortaZonaCosteira(
        jogador.x,
        jogador.y,
        novoY
    );

    if (portaZonaCosteira) {
        mudarCenario("casa", portaZonaCosteira);
        return;
    }


    // Movimento horizontal.
    if (
        temColisao(
            novoX,
            jogador.y
        ) === false
    ) {

        if (
            novoX !==
            jogador.x
        ) {
            andou = true;
        }

        jogador.x = novoX;
    }


    // Movimento vertical.
    if (
        temColisao(
            jogador.x,
            novoY
        ) === false
    ) {

        if (
            novoY !==
            jogador.y
        ) {
            andou = true;
        }

        jogador.y = novoY;
    }


    // Água não bloqueia.
    // Apenas causa afogamento.
    verificarAfogamento();

    atualizarAnimacao(
        andou,
        segundos
    );

    atualizarCamera();
}


// ============================================================================
// ANIMAÇÃO
// ============================================================================

function atualizarAnimacao(
    andou,
    segundos
) {

    if (andou === false) {

        jogador.quadro = 0;
        jogador.tempoAnimacao = 0;

    } else {

        jogador.tempoAnimacao += segundos;

        if (
            jogador.tempoAnimacao >=
            0.12
        ) {

            jogador.tempoAnimacao = 0;

            jogador.quadro++;

            if (
                jogador.quadro > 2
            ) {
                jogador.quadro = 0;
            }
        }
    }
}


// ============================================================================
// DESENHO DO JOGADOR
// ============================================================================

function obterDimensoesVisuaisJogador() {
    // As artes dos interiores foram compostas em uma escala maior que o mapa
    // externo. Dobrar somente o desenho do personagem mantém a leitura humana
    // da cena, sem mudar velocidade, portas ou colisões já acertadas na costa.
    const escalaInterior =
        cenarioAtual === "casa" &&
        interiorAtual !== null
            ? 2
            : 1;

    return {
        largura: jogador.largura * escalaInterior,
        altura: jogador.altura * escalaInterior
    };
}

function desenharJogador() {

    let linha = 1;

    if (
        jogador.direcao ===
        "baixo"
    ) {
        linha = 0;
    } else if (
        jogador.direcao ===
        "cima"
    ) {
        linha = 2;
    }

    const larguraQuadro =
        Math.floor(
            imagemPersonagem.naturalWidth /
            3
        );

    const topo =
        Math.floor(
            linha *
            imagemPersonagem.naturalHeight /
            3
        );

    const base =
        Math.floor(
            (linha + 1) *
            imagemPersonagem.naturalHeight /
            3
        );

    const recorteX =
        jogador.quadro *
        larguraQuadro +
        1;

    const recorteY =
        topo + 1;

    const larguraRecorte =
        larguraQuadro - 2;

    const alturaRecorte =
        base -
        topo -
        2;

    const dimensoesVisuais =
        obterDimensoesVisuaisJogador();

    const x =
        jogador.x -
        dimensoesVisuais.largura / 2 -
        cameraX;

    const y =
        jogador.y -
        dimensoesVisuais.altura +
        jogador.altura / 2 -
        cameraY;

    contexto.save();

    if (
        jogador.direcao ===
        "direita"
    ) {

        contexto.translate(
            x + dimensoesVisuais.largura,
            y
        );

        contexto.scale(
            -1,
            1
        );

    } else {

        contexto.translate(
            x,
            y
        );
    }

    contexto.drawImage(
        imagemPersonagem,

        recorteX,
        recorteY,
        larguraRecorte,
        alturaRecorte,

        0,
        0,
        dimensoesVisuais.largura,
        dimensoesVisuais.altura
    );

    contexto.restore();
}


// ============================================================================
// DEBUG
// ============================================================================

function desenharRetanguloDebug(
    x,
    y,
    largura,
    altura,
    preenchimento,
    contorno,
    texto
) {

    const telaX =
        x - cameraX;

    const telaY =
        y - cameraY;

    contexto.fillStyle =
        preenchimento;

    contexto.fillRect(
        telaX,
        telaY,
        largura,
        altura
    );

    contexto.strokeStyle =
        contorno;

    contexto.lineWidth =
        2 / zoom;

    contexto.strokeRect(
        telaX,
        telaY,
        largura,
        altura
    );

    if (texto) {

        contexto.font =
            `${11 / zoom}px Arial`;

        contexto.textBaseline =
            "top";

        const larguraTexto =
            contexto.measureText(
                texto
            ).width +
            6 / zoom;

        contexto.fillStyle =
            "rgba(0, 0, 0, 0.78)";

        contexto.fillRect(
            telaX,
            telaY,
            larguraTexto,
            15 / zoom
        );

        contexto.fillStyle =
            "#ffffff";

        contexto.fillText(
            texto,
            telaX + 3 / zoom,
            telaY + 2 / zoom
        );
    }
}

function desenharPoligonoDebug(pontos, preenchimento, contorno, texto) {
    if (pontos.length === 0) return;

    contexto.beginPath();
    contexto.moveTo(pontos[0].x - cameraX, pontos[0].y - cameraY);

    for (let i = 1; i < pontos.length; i++) {
        contexto.lineTo(pontos[i].x - cameraX, pontos[i].y - cameraY);
    }

    contexto.closePath();
    contexto.fillStyle = preenchimento;
    contexto.fill();
    contexto.strokeStyle = contorno;
    contexto.lineWidth = 2 / zoom;
    contexto.stroke();

    if (texto) {
        desenharRetanguloDebug(
            pontos[0].x,
            pontos[0].y,
            0,
            0,
            "rgba(0, 0, 0, 0)",
            "rgba(0, 0, 0, 0)",
            texto
        );
    }
}

function desenharObstaculoDebug(obstaculo, texto) {
    const colisor = normalizarObstaculo(obstaculo);
    const preenchimento = "rgba(255, 45, 45, 0.16)";
    const contorno = "rgba(255, 70, 70, 0.95)";

    if (colisor.tipo === "poligono") {
        desenharPoligonoDebug(
            colisor.pontos,
            preenchimento,
            contorno,
            texto
        );
        return;
    }

    desenharRetanguloDebug(
        colisor.x,
        colisor.y,
        colisor.largura,
        colisor.altura,
        preenchimento,
        contorno,
        texto
    );
}

function desenharDebug() {

    if (modoDebug === false) {
        return;
    }

    if (
        cenarioAtual ===
        "cidade"
    ) {

        // Água real detectada pelo mapa.
        if (
            imagemAguaDebug !==
            null
        ) {
            contexto.globalAlpha = 1;

            contexto.drawImage(
                imagemAguaDebug,
                -cameraX,
                -cameraY
            );

            contexto.globalAlpha = 1;
        }


        // Barreiras sólidas ficam vermelhas.
        const obstaculosAtivos = obterObstaculosAtivos();
        for (let i = 0; i < obstaculosAtivos.length; i++) {
            const obstaculo = obstaculosAtivos[i];

            desenharObstaculoDebug(obstaculo, `B${i + 1}`);
        }


        // Porta do mapa principal.
        if (mapaSelecionado.usaLayoutOriginal) {
            desenharRetanguloDebug(
                portaEsquerda,
                portaY - 8,
                portaDireita - portaEsquerda,
                16,
                "rgba(0, 255, 255, 0.16)",
                "rgba(0, 255, 255, 0.95)",
                "PORTA"
            );
        } else {
            for (const porta of portasZonaCosteira) {
                desenharRetanguloDebug(
                    porta.left,
                    porta.y - 8,
                    porta.right - porta.left,
                    16,
                    "rgba(0, 255, 255, 0.16)",
                    "rgba(0, 255, 255, 0.95)",
                    `PORTA ${porta.id.slice(-2)}`
                );
            }
        }


        // Limite do mapa.
        contexto.strokeStyle =
            "rgba(0, 220, 255, 0.95)";

        contexto.lineWidth =
            3 / zoom;

        contexto.strokeRect(
            -cameraX,
            -cameraY,
            larguraMapa,
            alturaMapa
        );
    } else if (interiorAtual !== null) {
        const limites = obterLimitesTransitaveisDaCasa();
        const saida = obterSaidaDaCasa();

        // O vermelho delimita a área física útil do interior, sem criar
        // marcas sobre móveis até que as colisões internas sejam adicionadas.
        contexto.strokeStyle = "rgba(255, 70, 70, 0.95)";
        contexto.lineWidth = 2 / zoom;
        contexto.strokeRect(
            limites.esquerda - cameraX,
            limites.topo - cameraY,
            limites.direita - limites.esquerda,
            limites.base - limites.topo
        );

        desenharRetanguloDebug(
            saida.esquerda,
            saida.y - 8,
            saida.direita - saida.esquerda,
            16,
            "rgba(0, 255, 255, 0.16)",
            "rgba(0, 255, 255, 0.95)",
            "SAÍDA"
        );
    }


    // Caixa visual completa do personagem.
    const dimensoesVisuais =
        obterDimensoesVisuaisJogador();

    const corpoX =
        jogador.x -
        dimensoesVisuais.largura / 2;

    const corpoY =
        jogador.y -
        dimensoesVisuais.altura +
        jogador.altura / 2;

    desenharRetanguloDebug(

        corpoX,
        corpoY,

        dimensoesVisuais.largura,
        dimensoesVisuais.altura,

        "rgba(255, 190, 0, 0.08)",
        "rgba(255, 190, 0, 0.95)",

        "SPRITE"
    );


    // Hitbox real.
    const hitbox =
        obterHitboxJogador(
            jogador.x,
            jogador.y
        );

    desenharRetanguloDebug(

        hitbox.x,
        hitbox.y,

        hitbox.largura,
        hitbox.altura,

        "rgba(50, 255, 90, 0.30)",
        "rgba(50, 255, 90, 1)",

        "HITBOX"
    );


    // Ponto central.
    contexto.fillStyle =
        "#ffffff";

    contexto.beginPath();

    contexto.arc(
        jogador.x - cameraX,
        jogador.y - cameraY,
        3 / zoom,
        0,
        Math.PI * 2
    );

    contexto.fill();


    // Painel de diagnóstico.
    contexto.setTransform(
        escalaPixels,
        0,
        0,
        escalaPixels,
        0,
        0
    );

    // No celular o seletor de mapa ocupa o canto superior direito.
    // O painel de debug desce um pouco e fica no lado esquerdo para não cobrir
    // os botões de mapa.
    const painelX =
        larguraTela < 700
            ? 10
            : larguraTela - 252;

    const painelY =
        larguraTela < 700
            ? 74
            : 12;

    contexto.fillStyle =
        "rgba(0, 0, 0, 0.78)";

    contexto.fillRect(
        painelX,
        painelY,
        240,
        112
    );

    contexto.fillStyle =
        "#ffffff";

    contexto.font =
        "12px Arial";

    contexto.textBaseline =
        "top";

    const estaEmInterior =
        cenarioAtual === "casa" &&
        interiorAtual !== null;

    contexto.fillText(
        "MODO DEBUG — F3",
        painelX + 10,
        painelY + 8
    );

    contexto.fillText(
        `Jogador: ${Math.round(jogador.x)}, ${Math.round(jogador.y)}`,
        painelX + 10,
        painelY + 28
    );

    contexto.fillText(
        `Hitbox: ${jogador.larguraColisao} x ${jogador.alturaColisao}`,
        painelX + 10,
        painelY + 46
    );

    if (estaEmInterior) {
        contexto.fillText(
            `Mapa: ${interiorAtual.nome}`,
            painelX + 10,
            painelY + 64
        );

        contexto.fillText(
            "Limite vermelho | Saída azul",
            painelX + 10,
            painelY + 82
        );

        contexto.fillText(
            "Esc ou saída inferior → costa",
            painelX + 10,
            painelY + 100
        );
    } else {
        contexto.fillText(
            `Sólidas: ${obterObstaculosAtivos().length} | Água: máscara`,
            painelX + 10,
            painelY + 64
        );

        contexto.fillText(
            `Água na hitbox: ${Math.round(
                porcentagemHitboxNaAgua(
                    jogador.x,
                    jogador.y
                )
            )}%`,
            painelX + 10,
            painelY + 82
        );

        contexto.fillText(
            `Afogamento em: ${porcentagemAfogamento}%`,
            painelX + 10,
            painelY + 100
        );
    }
}


// ============================================================================
// DESENHO PRINCIPAL
// ============================================================================

function desenharJogo() {

    contexto.setTransform(
        escalaPixels,
        0,
        0,
        escalaPixels,
        0,
        0
    );

    contexto.clearRect(
        0,
        0,
        larguraTela,
        alturaTela
    );

    contexto.save();

    contexto.scale(
        zoom,
        zoom
    );


    if (
        cenarioAtual ===
        "cidade"
    ) {

        contexto.drawImage(
            imagemMapa,

            -cameraX,
            -cameraY,

            larguraMapa,
            alturaMapa
        );

    } else {
        if (interiorAtual?.imagem?.naturalWidth > 0) {
            contexto.drawImage(
                interiorAtual.imagem,
                -cameraX,
                -cameraY,
                larguraMapa,
                alturaMapa
            );
        } else {
            // Mantém o interior original como fallback enquanto um mapa novo
            // ainda não foi selecionado.
            contexto.fillStyle = "#292c34";
            contexto.fillRect(
                0,
                0,
                larguraTela / zoom,
                alturaTela / zoom
            );
        }
    }


    desenharJogador();
    desenharDebug();

    contexto.restore();
}


// ============================================================================
// LOOP
// ============================================================================

function repetirJogo(
    tempoAtual
) {

    let segundos = 0;

    if (
        tempoAnterior !== 0
    ) {
        segundos =
            (
                tempoAtual -
                tempoAnterior
            ) / 1000;
    }

    // Evita saltos grandes.
    if (
        segundos > 0.05
    ) {
        segundos = 0.05;
    }

    tempoAnterior =
        tempoAtual;

    moverJogador(segundos);
    desenharJogo();

    requestAnimationFrame(
        repetirJogo
    );
}


// ============================================================================
// CONTROLES
// ============================================================================

function atualizarTextoControles() {

    if (
        cenarioAtual ===
        "casa"
    ) {

        const nomeCasa =
            interiorAtual?.nome || "Dentro da casa";

        controles.innerHTML =
            `<strong>${nomeCasa}</strong><br>
            WASD / Setas → Mover<br>
            F3 → ${
                modoDebug
                    ? "Esconder colisões"
                    : "Mostrar colisões"
            }<br>
            Esc ou saída inferior → Costa`;

    } else {

        controles.innerHTML =
            `<strong>${mapaSelecionado.nome}</strong><br>
            WASD / Setas → Mover<br>
            F3 → ${
                modoDebug
                    ? "Esconder colisões"
                    : "Mostrar colisões"
            }<br>
            <span style="color:#ff6666">
                Vermelho = ${
                    mapaSelecionado.usaLayoutOriginal
                        ? "barreira"
                        : "área física sólida"
                }
            </span> |
            <span style="color:#4ca8ff">
                Azul = água
            </span>`;
    }
}

function alternarModoDebug() {

    modoDebug =
        !modoDebug;

    const debugButton = document.getElementById("mobileDebug");

    if (debugButton) {
        debugButton.setAttribute("aria-pressed", String(modoDebug));
        debugButton.textContent = modoDebug ? "DEBUG ON" : "DEBUG";
    }

    atualizarTextoControles();
}


// ============================================================================
// INÍCIO
// ============================================================================

function iniciarJogo() {

    if (
        mapaCarregado &&
        personagemCarregado &&
        aguaCarregada &&
        jogoIniciado === false
    ) {

        jogoIniciado = true;

        aviso.style.display =
            "none";

        atualizarCamera();
        atualizarTextoControles();
        desenharJogo();

        requestAnimationFrame(
            repetirJogo
        );
    }
}


// ============================================================================
// EVENTOS
// ============================================================================

window.addEventListener(
    "keydown",
    function (evento) {

        const tecla =
            evento.key.toLowerCase();

        if (
            tecla === "f3"
        ) {

            alternarModoDebug();

            evento.preventDefault();

            return;
        }

        if (
            tecla === "escape" &&
            cenarioAtual ===
            "casa"
        ) {

            mudarCenario(
                "cidade"
            );

            return;
        }

        teclas[tecla] =
            true;

        if (
            tecla === "arrowup" ||
            tecla === "arrowdown" ||
            tecla === "arrowleft" ||
            tecla === "arrowright"
        ) {

            evento.preventDefault();
        }
    }
);

window.addEventListener(
    "keyup",
    function (evento) {

        const tecla =
            evento.key.toLowerCase();

        teclas[tecla] =
            false;
    }
);


// Se sair da janela,
// limpamos as teclas.
window.addEventListener(
    "blur",
    function () {
        teclas = {};
        limparEntradaMobile();
    }
);

window.addEventListener("orientationchange", () => {
    window.setTimeout(ajustarTela, 50);
});

window.addEventListener(
    "resize",
    ajustarTela
);


// ============================================================================
// CARREGAMENTO
// ============================================================================

imagemMapa.onload =
    function () {

        larguraCidade =
            imagemMapa.naturalWidth;

        alturaCidade =
            imagemMapa.naturalHeight;

        aplicarDimensoesDoCenario(imagemMapa);

        try {

            criarMascaraAgua();

            mapaCarregado =
                true;

            iniciarJogo();

        } catch (erro) {

            console.error(
                "Erro ao criar a máscara de água:",
                erro
            );

            aviso.textContent =
                "Erro ao preparar a água do mapa.";
        }
    };


imagemPersonagem.onload =
    function () {

        personagemCarregado =
            true;

        iniciarJogo();
    };


imagemMapa.onerror =
    function () {

        aviso.textContent =
            `Erro ao carregar ${mapaSelecionado.nome}.`;
    };


imagemPersonagem.onerror =
    function () {

        aviso.textContent =
            "Erro ao carregar personagem.png.";
    };


ajustarTela();
configurarControlesMobile();

const linkSelecionado = document.querySelector(
    `#mapSelector a[data-map="${mapaSelecionado.id}"]`
);

if (linkSelecionado) {
    linkSelecionado.setAttribute("aria-current", "page");
}

imagemMapa.src = mapaSelecionado.src;

imagemPersonagem.src =
    "../assets/maps/personagem.png";
