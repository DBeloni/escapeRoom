# Contagem regressiva da radiação

O contador fica no HUD da partida principal (`html/mapaPrincipal.html`) e começa quando os recursos do jogo terminam de carregar. Ele continua durante a exploração da costa e dos interiores.

## Sequência

O jogador tem uma contagem regressiva única de 5 minutos. O HUD mostra o tempo até a radiação matá-lo. Ao zerar, marca a exposição como fatal. O contador para ao ocorrer game over e reinicia quando a partida é reiniciada.

O sistema está isolado em `js/systems/timer/hordeTimer.js` e acompanha o tempo de jogo em segundos.
