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
    { id: "casa-costeira-01", left: 348, right: 382, y: 389, spawnY: 407 },
    { id: "casa-costeira-02", left: 699, right: 741, y: 418, spawnY: 436 },
    { id: "casa-costeira-03", left: 497, right: 539, y: 585, spawnY: 603 },
    { id: "casa-costeira-04", left: 631, right: 670, y: 748, spawnY: 766 },
    { id: "casa-costeira-05", left: 946, right: 984, y: 688, spawnY: 706 }
];

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
    // A água do mapa é predominantemente escura e azul.
    // Esse filtro separa a água da grama, madeira, terra e pedras.
    return (
        b > r * 1.25 &&
        b > g * 1.05 &&
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

function mudarCenario(destino, porta = null) {
    cenarioAtual = destino;

    if (destino === "casa") {

        if (mapaSelecionado.usaLayoutOriginal) {
            jogador.x = 650;
            jogador.y = 580;
        } else if (porta) {
            jogador.x = (porta.left + porta.right) / 2;
            jogador.y = 580;
            ultimaPortaEntrada = porta;
        }

        jogador.direcao = "cima";

        atualizarTextoControles();

    } else {

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

// Colisões desenhadas especificamente sobre a Zona Costeira (1375 × 1144).
// Os retângulos protegem prédios, cercas, árvores densas, bloqueios e paredões.
const obstaculosZonaCosteira = [
    // Penhascos e limites naturais.
    [48, 0, 1327, 134],
    [48, 130, 126, 50],
    [694, 130, 681, 92],
    [830, 214, 545, 126],
    [1180, 334, 195, 810],
    [1086, 864, 289, 280],
    [682, 1014, 508, 130],

    // Penhasco que separa a praia da área interna, preservando as escadas.
    [176, 175, 68, 463],

    // Degraus/penhascos internos do lado esquerdo e inferior.
    [242, 760, 48, 86],
    [382, 760, 72, 110],
    [454, 844, 40, 86],
    [454, 928, 225, 86],
    [830, 758, 88, 112],

    // Jardim cercado no alto.
    [248, 140, 445, 15],
    [248, 140, 17, 248],
    [676, 140, 17, 220],

    // Obstáculos grandes dentro do jardim.
    [274, 168, 52, 160],
    [332, 294, 116, 128],
    [603, 351, 59, 193],
    [688, 318, 124, 104],

    // Casas com portas abertas: a barreira é dividida para deixar
    // a abertura da porta realmente atravessável.

    // Casa superior esquerda.
    [310, 291, 111, 56],
    [310, 347, 38, 45],
    [382, 347, 39, 45],

    // Casa superior direita.
    [671, 317, 141, 79],
    [671, 396, 28, 27],
    [741, 396, 71, 27],

    // Hospital central.
    [450, 458, 140, 85],
    [450, 543, 47, 47],
    [539, 543, 51, 47],

    // Hospital inferior azul.
    [558, 642, 133, 67],
    [558, 709, 73, 44],
    [670, 709, 21, 44],

    // Casa da direita.
    [896, 570, 168, 70],
    [896, 640, 50, 48],
    [984, 640, 80, 48],

    // Casa inferior central: porta fechada/obstruída.
    [672, 658, 140, 96],

    // Estrutura do píer, que permanece inacessível por ficar sobre água.
    [192, 816, 180, 47],
    [192, 934, 180, 28],
    [192, 816, 35, 120],
    [337, 816, 35, 120],

    // Muros, cercas, árvores densas, carros e barricadas.
    [494, 346, 18, 80],
    [560, 430, 25, 28],
    [858, 349, 42, 220],
    [845, 585, 40, 65],
    [1074, 575, 24, 124],
    [1040, 637, 42, 32],
    [194, 632, 30, 36],
    [276, 404, 45, 28],
    [309, 454, 42, 27],
    [547, 614, 28, 24],
    [887, 611, 29, 40],
    [900, 690, 42, 70],
    [920, 758, 47, 130],
    [1035, 718, 32, 88],
    [1137, 718, 35, 90]
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

    // Interior da casa provisório.
    if (cenarioAtual === "casa") {
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

        const retanguloObstaculo = {
            x: obstaculo[0],
            y: obstaculo[1],
            largura: obstaculo[2],
            altura: obstaculo[3]
        };

        if (
            retangulosColidem(
                hitbox,
                retanguloObstaculo
            )
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

    const x =
        jogador.x -
        jogador.largura / 2 -
        cameraX;

    const y =
        jogador.y -
        jogador.altura / 2 -
        cameraY;

    contexto.save();

    if (
        jogador.direcao ===
        "direita"
    ) {

        contexto.translate(
            x + jogador.largura,
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
        jogador.largura,
        jogador.altura
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

            desenharRetanguloDebug(
                obstaculo[0],
                obstaculo[1],
                obstaculo[2],
                obstaculo[3],
                "rgba(255, 45, 45, 0.22)",
                "rgba(255, 70, 70, 0.95)",
                `B${i + 1}`
            );
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
    }


    // Caixa completa do personagem.
    const corpoX =
        jogador.x -
        jogador.largura / 2;

    const corpoY =
        jogador.y -
        jogador.altura / 2;

    desenharRetanguloDebug(

        corpoX,
        corpoY,

        jogador.largura,
        jogador.altura,

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

    contexto.fillText(
        `Sólidas: ${obstaculos.length} | Água: máscara`,
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

        contexto.fillStyle =
            "#292c34";

        contexto.fillRect(
            0,
            0,
            larguraTela / zoom,
            alturaTela / zoom
        );
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

        controles.innerHTML =
            `<strong>Dentro da casa</strong><br>
            WASD / Setas → Mover<br>
            F3 → ${
                modoDebug
                    ? "Esconder colisões"
                    : "Mostrar colisões"
            }<br>
            Esc → Sair`;

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
                Vermelho = barreira
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

        larguraMapa =
            imagemMapa.naturalWidth;

        alturaMapa =
            imagemMapa.naturalHeight;

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
