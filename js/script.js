// 1. Pegamos a tela do jogo. O contexto permite desenhar nela.
const canvas = document.getElementById("gameCanvas");
const contexto = canvas.getContext("2d");
const aviso = document.getElementById("loading");
const controles = document.getElementById("controls");

// O tamanho real do mapa é atualizado quando mapa.png termina de carregar.
let larguraMapa = 0;
let alturaMapa = 0;
const zoom = 1.8;
const imagemMapa = new Image();
const imagemPersonagem = new Image();

// Um objeto agrupa informações. Exemplo: jogador.x é a posição horizontal.
const jogador = {
    x: 650,
    y: 580,
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

// O cenário pode ser "cidade" ou "casa".
let cenarioAtual = "cidade";

// Spawn usado quando o jogador se afoga.
const spawn = {
    x: 650,
    y: 580
};

// Entrada da casa.
const portaEsquerda = 160;
const portaDireita = 236;
const portaY = 575;

// Quanto da hitbox precisa estar na água para o jogador se afogar.
const porcentagemAfogamento = 35;


// ============================================================================
// ÁGUA DO MAPA
// ============================================================================
// Em vez de usar retângulos aproximados, a água é detectada diretamente
// no mapa.png. Assim o sistema acompanha o contorno real da água.

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
    // 1 = parece água, mas ainda não sabemos se é oceano
    // 2 = água confirmada e conectada à borda do mapa
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

    mascaraAgua = candidatos;

    // Criamos a camada azul usada pelo modo debug.
    const canvasDebug = document.createElement("canvas");
    canvasDebug.width = largura;
    canvasDebug.height = altura;

    const contextoDebug = canvasDebug.getContext("2d");
    const camada = contextoDebug.createImageData(largura, altura);

    for (let i = 0; i < total; i++) {
        if (mascaraAgua[i] === 2) {
            const indicePixel = i * 4;

            camada.data[indicePixel] = 25;
            camada.data[indicePixel + 1] = 145;
            camada.data[indicePixel + 2] = 255;

            camada.data[indicePixel + 3] = 72;
        }
    }

    contextoDebug.putImageData(camada, 0, 0);

    imagemAguaDebug = canvasDebug;
    aguaCarregada = true;
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

    return (
        mascaraAgua[
            Math.floor(y) * larguraMapa + Math.floor(x)
        ] === 2
    );
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

function mudarCenario(destino) {
    cenarioAtual = destino;

    if (destino === "casa") {

        jogador.x = 650;
        jogador.y = 580;
        jogador.direcao = "cima";

        atualizarTextoControles();

    } else {

        jogador.x = 198;
        jogador.y = 605;
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

    for (
        let i = 0;
        i < obstaculos.length;
        i++
    ) {

        const obstaculo =
            obstaculos[i];

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


    // Entrada pela porta.
    if (
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
        for (
            let i = 0;
            i < obstaculos.length;
            i++
        ) {

            const obstaculo =
                obstaculos[i];

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


        // Porta.
        desenharRetanguloDebug(

            portaEsquerda,
            portaY - 8,

            portaDireita -
                portaEsquerda,

            16,

            "rgba(0, 255, 255, 0.16)",
            "rgba(0, 255, 255, 0.95)",

            "PORTA"
        );


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

    const painelX =
        larguraTela - 252;

    const painelY = 12;

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
            `<strong>Controles</strong><br>
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
    }
);

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
            "Erro ao carregar mapa.png.";
    };


imagemPersonagem.onerror =
    function () {

        aviso.textContent =
            "Erro ao carregar personagem.png.";
    };


ajustarTela();

imagemMapa.src =
    "../assets/maps/mapa.png";

imagemPersonagem.src =
    "../assets/maps/personagem.png";