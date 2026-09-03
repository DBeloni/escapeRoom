const cenario = document.getElementById('cenario');
const obstaculo = document.getElementById('obstaculo');

// Posição do jogador no mundo
let x = 0;
let y = 0;
const velocidade = 6;
const tamanhoJogador = 50;

// Posição fixa do obstáculo no mundo (X: 200, Y: 100)
const obs = { x: 200, y: 100, largura: 80, altura: 80 };

// Limites do mundo
const limiteMaximo = 1000;
const limiteMinimo = -1000;

const teclas = {};

window.addEventListener('keydown', (e) => teclas[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => delete teclas[e.key.toLowerCase()]);

const loop = () => {
    // Guardamos a posição antiga caso a gente precise voltar atrás (se bater)
    let proximoX = x;
    let proximoY = y;

    if (teclas.w) proximoY -= velocidade;
    if (teclas.s) proximoY += velocidade;
    if (teclas.a) proximoX -= velocidade;
    if (teclas.d) proximoX += velocidade;

    // TRAVA DE LIMITE DO MUNDO
    if (proximoX > limiteMaximo) proximoX = limiteMaximo;
    if (proximoX < limiteMinimo) proximoX = limiteMinimo;
    if (proximoY > limiteMaximo) proximoY = limiteMaximo;
    if (proximoY < limiteMinimo) proximoY = limiteMinimo;

    // DETECÇÃO DE COLISÃO (A matemática para ver se dois quadrados se sobrepõem)
    const bateuNoObstaculo =
        proximoX < obs.x + obs.largura &&
        proximoX + tamanhoJogador > obs.x &&
        proximoY < obs.y + obs.altura &&
        proximoY + tamanhoJogador > obs.y;

    // Se NÃO bateu, nós aceitamos a nova posição do jogador
    if (!bateuNoObstaculo) {
        x = proximoX;
        y = proximoY;
    }

    // Move o fundo do cenário
    cenario.style.backgroundPosition = `${-x}px ${-y}px`;

    // Move o obstáculo na tela baseado na posição da "câmera"
    // Como o jogador está no centro (0,0 da tela), calculamos a distância dele para o obstáculo
    const telaCentroX = window.innerWidth / 2;
    const telaCentroY = window.innerHeight / 2;

    // Posiciona a caixa vermelha no lugar certo do mundo em relação ao jogador
    obstaculo.style.left = `${telaCentroX - (tamanhoJogador / 2) + (obs.x - x)}px`;
    obstaculo.style.top = `${telaCentroY - (tamanhoJogador / 2) + (obs.y - y)}px`;

    requestAnimationFrame(loop);
};

loop();