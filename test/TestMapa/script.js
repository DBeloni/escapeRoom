// 1. Pegamos a tela do jogo. O contexto permite desenhar nela.
const canvas = document.getElementById("gameCanvas");
const contexto = canvas.getContext("2d");
const aviso = document.getElementById("loading");

const larguraMapa = 1338;
const alturaMapa = 1176;
const zoom = 1.8;
const imagemMapa = new Image();
const imagemPersonagem = new Image();

// Um objeto agrupa informações. Exemplo: jogador.x é a posição horizontal.
const jogador = {
    x: 650,
    y: 580,
    largura: 32,
    altura: 37,
    larguraColisao: 20,
    alturaColisao: 14,
    velocidade: 180, // Distância percorrida em um segundo.
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
let jogoIniciado = false;

// O cenário pode ser "cidade" ou "casa".
let cenarioAtual = "cidade";
const controles = document.getElementById("controls");
const controlesCidade = controles.innerHTML;

// Porta da casa amarela com telhado verde, à esquerda do mapa.
// A entrada fica logo antes do retângulo que bloqueia a casa.
const portaEsquerda = 180;
const portaDireita = 216;
const portaY = 576;

function mudarCenario(destino) {
    cenarioAtual = destino;
    if (destino === "casa") {
        // Por enquanto, o interior é apenas um cenário vazio.
        jogador.x = 650;
        jogador.y = 580;
        jogador.direcao = "cima";
        controles.textContent = "Dentro da casa | WASD / Setas: mover | Esc: sair";
    } else {
        // Ao sair, aparecemos na frente da mesma porta.
        jogador.x = 198;
        jogador.y = 605;
        jogador.direcao = "baixo";
        controles.innerHTML = controlesCidade;
    }
    teclas = {};
    jogador.quadro = 0;
    jogador.tempoAnimacao = 0;
    tempoAnterior = 0;
    atualizarCamera();
}

// 2. Cada obstáculo é uma lista: [x, y, largura, altura].
// Esses retângulos ficam sobre paredes, casas e outros locais bloqueados.
const obstaculos = [
    [0, 0, 1338, 20],
    [0, 0, 20, 1176],
    [1318, 0, 20, 1176],
    [28, 55, 188, 122],
    [218, 20, 187, 158],
    [404, 55, 154, 123],
    [558, 25, 188, 106],
    [746, 55, 134, 123],
    [875, 150, 407, 25],
    [1273, 150, 22, 575],
    [25, 795, 98, 24],
    [968, 246, 209, 147],
    [134, 420, 199, 160],
    [405, 444, 154, 139],
    [741, 431, 159, 146],
    [150, 678, 264, 160],
    [736, 696, 165, 129],
    [898, 543, 365, 35],
    [0, 289, 249, 179],
    [248, 358, 225, 110],
    [0, 466, 27, 511],
    [479, 751, 149, 125],
    [479, 869, 113, 113],
    [627, 855, 275, 68],
    [894, 680, 111, 163],
    [1001, 819, 192, 70],
    [0, 976, 489, 200],
    [489, 981, 445, 195],
    [1154, 889, 184, 287],
    [1190, 680, 148, 210]
];

function ajustarTela() {
    const tamanho = canvas.getBoundingClientRect();
    larguraTela = tamanho.width;
    alturaTela = tamanho.height;

    // Mantém a imagem nítida em monitores com mais pixels.
    escalaPixels = window.devicePixelRatio || 1;
    canvas.width = Math.floor(larguraTela * escalaPixels);
    canvas.height = Math.floor(alturaTela * escalaPixels);
    contexto.imageSmoothingEnabled = false;
    atualizarCamera();
}

// 3. Verificamos se os pés do jogador encostam em algum obstáculo.
function temColisao(x, y) {
    const esquerda = x - jogador.larguraColisao / 2;
    const topo = y + jogador.altura / 2 - jogador.alturaColisao;
    const direita = esquerda + jogador.larguraColisao;
    const base = topo + jogador.alturaColisao;

    // No cenário vazio, só bloqueamos as bordas, sem usar as casas da cidade.
    if (cenarioAtual === "casa") {
        if (esquerda < 0 || direita > larguraMapa || topo < 0 || base > alturaMapa) {
            return true;
        }
        return false;
    }

    for (let i = 0; i < obstaculos.length; i++) {
        const obstaculo = obstaculos[i];
        const obstaculoX = obstaculo[0];
        const obstaculoY = obstaculo[1];
        const obstaculoLargura = obstaculo[2];
        const obstaculoAltura = obstaculo[3];

        if (esquerda < obstaculoX + obstaculoLargura &&
            direita > obstaculoX &&
            topo < obstaculoY + obstaculoAltura &&
            base > obstaculoY) {
            return true;
        }
    }

    return false;
}

function atualizarCamera() {
    const larguraVisivel = larguraTela / zoom;
    const alturaVisivel = alturaTela / zoom;

    // A câmera tenta deixar o jogador no centro da tela.
    cameraX = jogador.x - larguraVisivel / 2;
    cameraY = jogador.y - alturaVisivel / 2;

    // Nas bordas, ela para para não mostrar espaço fora do mapa.
    if (cameraX > larguraMapa - larguraVisivel) {
        cameraX = larguraMapa - larguraVisivel;
    }
    if (cameraY > alturaMapa - alturaVisivel) {
        cameraY = alturaMapa - alturaVisivel;
    }
    if (cameraX < 0) {
        cameraX = 0;
    }
    if (cameraY < 0) {
        cameraY = 0;
    }
}

// 4. Primeiro lemos as teclas; depois calculamos e tentamos o movimento.
function moverJogador(segundos) {
    let horizontal = 0;
    let vertical = 0;

    if (teclas.d || teclas.arrowright) {
        horizontal = horizontal + 1;
    }
    if (teclas.a || teclas.arrowleft) {
        horizontal = horizontal - 1;
    }
    if (teclas.s || teclas.arrowdown) {
        vertical = vertical + 1;
    }
    if (teclas.w || teclas.arrowup) {
        vertical = vertical - 1;
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

    // Na diagonal, dividimos por raiz de 2 para não andar mais rápido.
    if (horizontal !== 0 && vertical !== 0) {
        horizontal = horizontal / Math.sqrt(2);
        vertical = vertical / Math.sqrt(2);
    }

    let andou = false;
    const novoX = jogador.x + horizontal * jogador.velocidade * segundos;
    const novoY = jogador.y + vertical * jogador.velocidade * segundos;

    // Entramos ao andar para cima pela porta, antes de testar a parede.
    if (cenarioAtual === "cidade" && vertical < 0 &&
        jogador.x >= portaEsquerda && jogador.x <= portaDireita &&
        novoX >= portaEsquerda && novoX <= portaDireita &&
        jogador.y >= portaY && novoY <= portaY) {
        mudarCenario("casa");
        return;
    }

    // Testamos os eixos separadamente para permitir andar junto às paredes.
    if (temColisao(novoX, jogador.y) === false) {
        if (novoX !== jogador.x) {
            andou = true;
        }
        jogador.x = novoX;
    }
    if (temColisao(jogador.x, novoY) === false) {
        if (novoY !== jogador.y) {
            andou = true;
        }
        jogador.y = novoY;
    }

    atualizarAnimacao(andou, segundos);
    atualizarCamera();
}

function atualizarAnimacao(andou, segundos) {
    if (andou === false) {
        jogador.quadro = 0;
        jogador.tempoAnimacao = 0;
    } else {
        jogador.tempoAnimacao = jogador.tempoAnimacao + segundos;

        // Alternamos entre os quadros 0, 1 e 2 a cada 0,12 segundo.
        if (jogador.tempoAnimacao >= 0.12) {
            jogador.tempoAnimacao = 0;
            jogador.quadro = jogador.quadro + 1;
            if (jogador.quadro > 2) {
                jogador.quadro = 0;
            }
        }
    }
}

// 5. A imagem tem 3 linhas (baixo, lado, cima) e 3 quadros por linha.
// drawImage permite desenhar só o pedaço que precisamos da imagem original.
function desenharJogador() {
    let linha = 1;
    if (jogador.direcao === "baixo") {
        linha = 0;
    } else if (jogador.direcao === "cima") {
        linha = 2;
    }

    const larguraQuadro = Math.floor(imagemPersonagem.naturalWidth / 3);
    const topo = Math.floor(linha * imagemPersonagem.naturalHeight / 3);
    const base = Math.floor((linha + 1) * imagemPersonagem.naturalHeight / 3);

    // Ignoramos um pixel em cada borda para não mostrar linhas do recorte.
    const recorteX = jogador.quadro * larguraQuadro + 1;
    const recorteY = topo + 1;
    const larguraRecorte = larguraQuadro - 2;
    const alturaRecorte = base - topo - 2;
    const x = jogador.x - jogador.largura / 2 - cameraX;
    const y = jogador.y - jogador.altura / 2 - cameraY;

    // save/restore fazem o espelhamento valer apenas para o personagem.
    contexto.save();
    if (jogador.direcao === "direita") {
        // Usamos o desenho da esquerda espelhado para olhar à direita.
        contexto.translate(x + jogador.largura, y);
        contexto.scale(-1, 1);
    } else {
        contexto.translate(x, y);
    }
    // Imagem, recorte de origem (x, y, largura, altura)
    // e destino na tela (x, y, largura, altura).
    contexto.drawImage(
        imagemPersonagem,
        recorteX, recorteY, larguraRecorte, alturaRecorte,
        0, 0, jogador.largura, jogador.altura
    );
    contexto.restore();
}

function desenharJogo() {
    // Reiniciamos a escala antes de limpar e desenhar o próximo quadro.
    contexto.setTransform(escalaPixels, 0, 0, escalaPixels, 0, 0);
    contexto.clearRect(0, 0, larguraTela, alturaTela);
    contexto.save();
    contexto.scale(zoom, zoom);
    if (cenarioAtual === "cidade") {
        contexto.drawImage(imagemMapa, -cameraX, -cameraY, larguraMapa, alturaMapa);
    } else {
        // Fundo liso provisório. O desenho do interior será feito depois.
        contexto.fillStyle = "#292c34";
        contexto.fillRect(0, 0, larguraTela / zoom, alturaTela / zoom);
    }
    desenharJogador();
    contexto.restore();
}

// 6. O navegador chama esta função a cada quadro da animação.
function repetirJogo(tempoAtual) {
    let segundos = 0;
    if (tempoAnterior !== 0) {
        segundos = (tempoAtual - tempoAnterior) / 1000;
    }
    // Evita saltos grandes quando a aba fica parada por algum tempo.
    if (segundos > 0.05) {
        segundos = 0.05;
    }
    tempoAnterior = tempoAtual;

    moverJogador(segundos);
    desenharJogo();
    requestAnimationFrame(repetirJogo);
}

function iniciarJogo() {
    if (mapaCarregado && personagemCarregado && jogoIniciado === false) {
        jogoIniciado = true;
        aviso.style.display = "none";
        atualizarCamera();
        desenharJogo();
        requestAnimationFrame(repetirJogo);
    }
}

// 7. Eventos avisam quando uma tecla ou a janela muda.
window.addEventListener("keydown", function (evento) {
    const tecla = evento.key.toLowerCase();
    if (tecla === "escape" && cenarioAtual === "casa") {
        mudarCenario("cidade");
        return;
    }
    teclas[tecla] = true;

    if (tecla === "arrowup" || tecla === "arrowdown" ||
        tecla === "arrowleft" || tecla === "arrowright") {
        evento.preventDefault();
    }
});

window.addEventListener("keyup", function (evento) {
    const tecla = evento.key.toLowerCase();
    teclas[tecla] = false;
});

// Se sair da janela, esquecemos as teclas para o jogador não andar sozinho.
window.addEventListener("blur", function () {
    teclas = {};
});

window.addEventListener("resize", ajustarTela);

// Só iniciamos depois que as duas imagens terminarem de carregar.
imagemMapa.onload = function () {
    mapaCarregado = true;
    iniciarJogo();
};

imagemPersonagem.onload = function () {
    personagemCarregado = true;
    iniciarJogo();
};

imagemMapa.onerror = function () {
    aviso.textContent = "Erro ao carregar mapa.png.";
};

imagemPersonagem.onerror = function () {
    aviso.textContent = "Erro ao carregar personagem.png.";
};

ajustarTela();
imagemMapa.src = "mapa.png";
imagemPersonagem.src = "personagem.png";
